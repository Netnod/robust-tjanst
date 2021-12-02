[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)

# Robust Tjänst by Netnod

Robust Tjänst is a test tool for web sites with the intention of making the internet a better place.

## What it is / what it will be

We aim to establish a minimum level of requirements, a de facto standard, for all websites to be considered reliable. We will do this by creating a collection of tests written as docker images and a test runner with accompaning site for testing a site. We encourage everyone to be involved in this process and we have just started building the basic building blocks.

To make it easier to use we are also planning to create a live badge you can use when you have reached the minimum level. The badge will keep track of changes so you and your visitors can the sure everything OK.

## Current status

We are just getting started. These are some milestones that we think will be important. 

- [x] Basic site 
- [x] Scheduling tests running safely in Kubernetes
- [x] Name of the project: Robust Tjänst
- [x] Template for test runners
- [ ] Build an open source community <- we/you are here ❤️
- [ ] Logotype and badge design
- [ ] Implement basic tests for minimum requirements
- [ ] Combined test docker image
- [ ] Register and run tests in background
- [ ] Launch 🎉
- [ ] Continue developing as open source
- [ ] Spread the word

# How to contribute

We are looking for general feedback of the idea and input on minimum tests/requirements. We would love your help to produce tests. Look at the [example tests](packages/tests/tests) to get started.

If you find any bugs or have ideas we are super happy for [issues](https://github.com/Netnod/robust-tjanst/issues) or even [pull requests](https://github.com/Netnod/robust-tjanst/pulls).

All code is released under the [BSD 3-Clause License](LICENSE).
   
### What is a minimum level?

A good minimum level is what is an acceptable level of security. Passing should be easy, and failing should be bad.

When the minimum level for a site is not reached we want it to be very easy to understand:

  1. Why it is bad in words that can be understood by those who are not experts.
  2. What to do to fix it
  3. Why it is a good idea to invest in fixing the problems
  4. A carrot when they are fixed (the ❤️ badge)

### Help people be better
We want to help people reach the minimum acceptable level by giving clear instructions.

### Security considerations

We have designed the solution so that you can use the tests separately when you want to test your domain/website without leaking any information to anyone else. The isolation model with the tests run in a isolated namespace with limited access to both Internet and the rest of the environment. This way we can make sure we both secure your and our data and infrastructure.

# How to run the code

To run the project you will need [Skaffold](https://skaffold.dev) installed and Kubernetes cluster running somewhere. The cluster could be a local one such as [Minikube](https://minikube.sigs.k8s.io), MicroK8s or Docker Desktop, a cloud environment such as GKE, EKS, AKS or some other cluster.

To deploy the solution you will need Skaffold and kubectl
 and make sure you are in the right Kubernetes context and run:

## Create secrets for the web service
    kubectl apply -f k8s/namespaces.yaml
    kubectl create --namespace='dev' secret generic signed-cookie-keys --from-literal=SIGNED_COOKIE_KEYS=$(dd if=/dev/urandom bs=48 count=1 | base64)

## Start the services
    skaffold run

## Setup the result database
    # Press tab to use tab completion to get the name of the pod
    # if tab doesn't work use `kubectl get pods` and find the `web-` pod
    kubectl exec -n dev web-[TAB] -- sh setup.sh

## Reaching the running service
Now everything is running. But if you don't have ingress controller set up (like when using Minikube) you must forward a port to reach the web service using

    kubectl port-forward [NAME OF web- POD] 3000:3000

then you can reach the site at http://localhost:3000

# Building tests
See test [README](/packages/tests/tests/README.md)

If you have changed tests, deploy them all with skaffold

    cd packages/tests
    skaffold build

# Development of the website
This assumes that you have the cluster running as described in [How to run the code](#How-to-run-the-code)

Install yarn and dependencies
```
nvm use
npm install -g yarn
yarn
```
Forward ports to databases in Kubernetes

_All k8s commands should run in the `dev` namespace_
```
kubectl port-forward postgresql-postgresql-0 5432
kubectl port-forward redis-master-0 6379
```
Create an environment file
```
cp packages/web/.env.template packages/web/.env
# edit the new file and insert values from you get kubernetes (see below)
```
Get secrets from Kubernetes 
```
kubectl get secrets postgresql -o jsonpath='{.data}'
# will return something like {"postgresql-password":"UktVYVAzZ2Z5Zg=="}
# decode it with
echo "UktVYVAzZ2Z5Zg==" | base64 -d
# put this value in the .env file replacing where is says PG-PASSWORD

# do the same thing but for redis password, replacing REDIS-PASSWORD
kubectl get secrets redis -o jsonpath='{.data}'
```

Build the CSS
```
yarn css:build
```

Now you can run the web service
```
cd packages/web
yarn dev
```

# LICENSE

(c) Copyright 2021 Netnod AB - All code is released under the [BSD 3-Clause License](LICENSE).
