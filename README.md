TODO: Write a readme

Note `.env` in the root. It contains explanations for each variable needed

# Installation

## External dependencies

### Postgres 13
Although any version above 11 ought to work, 13 is the one used for development.

An environment variable called DATABASE_URL is expected to be a full connection string pointing to a database that can be freely used by the application. When running through Docker this is expected to be present inside the container.

## Without Docker

```
# pre-reqs: node version manager https://github.com/nvm-sh/nvm
nvm install
nvm use
npm ci
```

# Building
## With Docker
```
docker build -t robust-aaa . 
```

# Running
## Without Docker
```

npm run start # serves on localhost:PORT
# for devs: npm run dev

npm run css:build # compiles frontend css into public/style.css
# for devs: npm run css:watch
```

## Run with docker
```
docker run --rm -it -p 3000:3000 robust-aaa 
```

# Developing
## Setting up the database

```
createdb robust-aaa
psql -d robust-aaa -f src/db/schema.sql
```

## Adding fake data to the database
Convenient while developing. Adds a few accounts/websites/tests.

```
npm run db:seed
```