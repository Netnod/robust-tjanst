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
      activeDeadlineSeconds: 25,
      restartPolicy: "Never",
      containers: [
        {
          name,
          image: image,
          args: arguments
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
    .then((res) => {
      //console.log(res.body)
      const pod = {
        log: () => k8sApi.readNamespacedPodLog(name, namespace, null, true).then(({response}) => response.body),
        status: () => k8sApi.readNamespacedPodStatus(name, namespace, 'true'),
        done: () => waitUntilSucceeded(pod),
        name
      }
      return pod
    })
    .catch((err = {}) => {
      const {response: {body: {status, reason, message} = {}}} = err
      console.error(`kubernetes error: ${status}: ${reason} - ${message}`)
      throw err;
    })
}

const deleteTest = (name) => {
  const k8sApi = getk8s()
  return k8sApi.deleteNamespacedPod(name, namespace)
}


const waitUntilSucceeded = async (pod, tries = 0) => {
  if (tries >= 60) return Promise.reject('Timeout: Ran out of tries')

  const response = await pod.status()
  const phase = response.body?.status.phase

  switch(phase){
    case 'Succeeded': return phase
    case 'Failed':
    case 'Unknown':
      return Promise.reject(response)
    default:
      await wait(1000)
      return waitUntilSucceeded(pod, ++tries)
  }
}

const log = pod => pod.log()

module.exports = {
  startTest,
  deleteTest,
  waitUntilSucceeded,
  log
}
