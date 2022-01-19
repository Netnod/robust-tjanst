const {KubernetesError} = require('../errors')

const k8s = require("@kubernetes/client-node")
const kc = new k8s.KubeConfig()
import('is-docker').then(d => {
  if (d.default()) {
    console.debug('loading k8s from cluster')
    kc.loadFromCluster()
  } else {
    kc.loadFromDefault()
  }
})

const POD_DEADLINE_SECONDS = 60
const POD_STATUS_POLL_WAIT_TIME_MS = 1000

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function getk8s() {
  return kc.makeApiClient(k8s.CoreV1Api)
}

const spec = (image, name, labels = {}, arguments = []) => {
  return {
    apiVersion: "v1",
    kind: "Pod",
    metadata: { name, labels },
    spec: {
      activeDeadlineSeconds: POD_DEADLINE_SECONDS,
      restartPolicy: "Never",
      containers: [
        {
          name,
          image: image,
          args: arguments,
          imagePullPolicy: "Always"
        },
      ],
    },
  };
}

const namespace = 'tests'
const startTest = (image, name, id, arguments) => {
  const body = spec(image, name, { job_id: id }, arguments)
  const k8sApi = getk8s()

  return k8sApi
    .createNamespacedPod(namespace, body)
    .then(
      (res) => {
        const pod = {
          log: () => k8sApi.readNamespacedPodLog(name, namespace, null, true).then(({response}) => { 
            if (typeof response.body === "object") {
              // It is unclear why this happens
              return JSON.stringify(response.body)
            }
            return response.body
          }),
          status: () => k8sApi.readNamespacedPodStatus(name, namespace, 'true'),
          done: () => waitUntilSucceeded(pod),
          name
        }
        return pod
      },
      (err) => {
        try {
          const {response: {body: {status, reason, message} = {}}} = err
          console.error(`kubernetes error: ${status}: ${reason} - ${message}`)
          throw new KubernetesError(message, err)
        } catch {
          // We might get here if we can't connect to the cluster
          console.error(err)
          throw err
        }
      }
    )
}

const deleteTest = (name) => {
  const k8sApi = getk8s()
  return k8sApi.deleteNamespacedPod(name, namespace)
}


const waitUntilSucceeded = async (pod, tries = 0) => {
  if (tries >= POD_DEADLINE_SECONDS) {
    throw new KubernetesError(`Timeout: Ran out of tries (tried ${tries} times and waited ${POD_STATUS_POLL_WAIT_TIME_MS}ms between each try)`)
  }

  const response = await pod.status()
  const {body} = response
  const phase = body?.status.phase

  switch (phase) {
    case 'Succeeded': return phase
    case 'Failed':
      throw new KubernetesError(`Pod phase is "${phase}"`, body)
    case 'Running':
    case 'Pending':
      // K8s just keeps going until the deadline is reached if it can't pull the image.
      const containerStatues = body?.status?.containerStatuses || []
      if (containerStatues.find(status => status?.state?.waiting?.reason === "ErrImagePull")) {
        throw new KubernetesError(`Pod image not found`, body)
      }

      await wait(POD_STATUS_POLL_WAIT_TIME_MS)
      return waitUntilSucceeded(pod, ++tries)
    default:
      // This should not be reachable
      throw new KubernetesError(`Unknown Pod phase "${phase}"`, body)
  }
}

const log = pod => pod.log()

module.exports = {
  startTest,
  deleteTest,
  waitUntilSucceeded,
  log
}
