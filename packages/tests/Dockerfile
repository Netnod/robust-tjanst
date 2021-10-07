FROM node:16.6-alpine3.14
COPY package.json .
COPY yarn.lock .
RUN yarn
COPY . .
CMD yarn start