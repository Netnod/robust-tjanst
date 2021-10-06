const k8s = require("@kubernetes/client-node")
const kc = new k8s.KubeConfig()
kc.loadFromDefault(); // reads from local kubectl config, use when running outside k8s
//kc.loadFromCluster() // read service account info from pod, use when running in k8s
const k8sApi = kc.makeApiClient(k8s.CoreV1Api)
const request = require('request')

function spec(image, name, labels = {}, environment = {}) {
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
          image: "bash",
          env: Object.entries(environment).map(([name, value]) => ({
            name,
            value,
          })),
          command: [
            "/usr/local/bin/bash",
            "-c",
            "sleep 1s && if (( $RANDOM % 2 == 0 )); then echo '{name:test0 status:pass}'; else echo {name:test0 status:fail}; fi",
          ],
        },
      ],
    },
  };
}

function startTest(image, name, id, environment) {
  namespace = 'tests'
  const body = spec(image, name, { job_id: id }, environment)
  console.log('scheduling test', name, body)

  return k8sApi
    .createNamespacedPod(namespace, body)
    .then((res) => {
      //console.log(res.body)
      return {
        log: k8sApi.readNamespacedPodLog(name, namespace, null, true),
        status: k8sApi.readNamespacedPodStatus(name, namespace, 'true')
      }
    })
    .catch(err => {
      console.error('kubernetes error')
      return Promise.reject(err)
    })
}

module.exports = {
  startTest,
};
