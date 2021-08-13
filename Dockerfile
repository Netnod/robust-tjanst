FROM node:16.6-alpine3.14

# CI dependencies used by application
RUN apk add \
  # dig
  bind-tools 


ENV APP_HOME /app
WORKDIR $APP_HOME

# npm deps
COPY package.json .
COPY package-lock.json .
RUN npm ci

COPY . .

RUN npm run css:build

ENV PORT 3000
EXPOSE $PORT

ENTRYPOINT npm run start