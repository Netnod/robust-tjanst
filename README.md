[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)

# Robust Tjänst by Netnod

Robust Tjänst is a test tool for web sites with the intention of making the internet a better place.

## What it is / what it will be

We aim to establish a minimum level of requirements, a de facto standard, for all websites to be considered reliable. We will do this by creating a collection of tests written as docker images and a test runner with accompaning site for testing a site. We encourage everyone to be involved in this process and we have just started building the basic building blocks.

These are some examples of the tests we aim to create: 

    docker run --rm netnodse/robust-dns www.example.com
    docker run --rm netnodse/robust-tls www.example.com
    docker run --rm netnodse/robust-ipv6 www.example.com

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

# Setup solution

To set up the whole solution you will need a Kubernetes cluster, either a local one (Minikube, MicroK8s or Docker Desktop) or a cloud environment such as GKE, EKS, AKS.

To deploy the solution you will need Skaffold and make sure you are in the right Kubernetes context and run:

    kubectl apply -f k8s/namespaces.yaml
    kubectl create --namespace='dev' secret generic signed-cookie-keys --from-literal=SIGNED_COOKIE_KEYS=$(dd if=/dev/urandom bs=48 count=1 | base64)
    skaffold run

If you have changed tests, then deploy them like this:

    cd packages/tests
    skaffold build

## Build and test a robust test:

    cd packages/tests/test/[test name]
    docker build -t [test name] .
    docker run --rm [test name] https://example.com

You can create your own test by adapting some of our examples. Each test should emit json explaining the test result and a short description on how to mitigate the errors. The format of the returned JSON is not decided yet. _We aim to find a standard here on a parsable format which is both readable in a command line and can be used to help users in the website_.

## Development of the website

```
nvm use
npm install -g yarn
yarn
```

### Database
```
# inside packages/web/ 

createuser robust
createdb robust-tjanst -O robust
psql -d robust-tjanst -U robust < packages/service/src/db/schema.sql

# seed is optional
DATABASE_URL=postgres://robust@localhost/robust-tjanst yarn run db:seed
```

# Run
## Locally
```
cd packages/web && yarn run:dev # reloads on file changes
```

## LICENSE

(c) Copyright 2021 Netnod AB - All code is released under the [BSD 3-Clause License](LICENSE).
