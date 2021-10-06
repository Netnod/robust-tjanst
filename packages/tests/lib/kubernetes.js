const k8s = require("@kubernetes/client-node")
const kc = new k8s.KubeConfig()
kc.loadFromDefault(); // reads from local kubectl config, use when running outside k8s
//kc.loadFromCluster() // read service account info from pod, use when running in k8s
const k8sApi = kc.makeApiClient(k8s.CoreV1Api)
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const spec = (image, name, labels = {}, environment = {}) => {
  return {
    apiVersions: "core/v1",
    kind: "Pod",
    metadata: { name, labels },
    spec: {
      activeDeadlineSeconds: 25,
      restartPolicy: "Never",
      containers: [
        {
          name,
          image: image,
          env: Object.entries(environment).map(([name, value]) => ({
            name,
            value,
          })),
        },
      ],
    },
  };
}

const namespace = 'tests'
const startTest = (image, name, id, environment) => {
  const body = spec(image, name, { job_id: id }, environment)
  console.log('scheduling test', name, body)

  return k8sApi
    .createNamespacedPod(namespace, body)
    .then((res) => {
      //console.log(res.body)
      const pod = {
        log: () => k8sApi.readNamespacedPodLog(name, namespace, null, true).then(({response}) => response.body),
        status: () => k8sApi.readNamespacedPodStatus(name, namespace, 'true'),
        done: () => waitUntilSucceeded(pod)
      }
      return pod
    })
    .catch(({response: {body: {status, reason, message} = {}} = {}}) => {
      console.error(`kubernetes error: ${status}: ${reason} - ${message}`)
      return Promise.reject(err)
    })
}

const deleteTest = (name) => {
  return k8sApi.deleteNamespacedPod(name, namespace)
}


const waitUntilSucceeded = async (pod, tries = 0) => {
  if (tries >= 60) return Promise.reject('Timeout')

  const response = await pod.status()
  const phase = response.body?.status.phase

  switch(phase){
    case 'Succeeded': return phase
    case 'Failed':
    case 'Unknown':
      return Promise.reject(phase)
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
