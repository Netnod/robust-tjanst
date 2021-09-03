
# Setup
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