# Robust Tjänst by Netnod
Robust Tjänst is a test tool for web sites with the intention of making the internet a better place.

## Get started
  

### Create a minimum level
We want to create a minimum level for what is an acceptable level of security. Passing should be easy, and failing should be bad.

### Spread knowledge
We want to explain why not passing this minimum level is bad, in words that can be understood by those who are not experts.

### Help people be better
We want to help people reach the minimum acceptable level by giving clear instructions.

### Contribute
Currently we would like feedback on what tests _you_ think should be included in this minimum level,

We welcome pull requests and issues on https://github.com/Netnod/robust-tjanst/
Code is released under the [BSD 3-Clause License](LICENSE).

# Setup
_The documentation is already slightly incorrect, but we'll be updating it soon. See `packages/service/.env.template` for how to set up its .env file._
## Local
### Postgres 13 and Redis
Both are expected to be running on localhost at default ports. DATBASE_URL and REDIS_URL can be overriden if required.

### NodeJS
Requires NVM.

```
# inside project root folder

nvm use
npm install -g yarn
yarn
```

### Database
```
# inside packages/service/ 

createuser robust
createdb robust-tjanst -O robust
psql -d robust-tjanst -U robust < packages/service/src/db/schema.sql

# seed is optional
DATABASE_URL=postgres://robust@localhost/robust-tjanst yarn run db:seed
```

# Build
## Service
```
docker build -t service -f Dockerfile.service .

```

# Run
## Locally
```
cd packages/service && yarn run:dev # reloads on file changes
```
