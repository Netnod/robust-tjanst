TODO: Write a readme

Note `.env` in the root.

## Run outside of docker
```
# pre-reqs: node version manager https://github.com/nvm-sh/nvm
nvm install
nvm use
npm ci
npm run start # serves on localhost:PORT
# for devs: npm run dev
```

## Run with docker
```
docker build -t robust-aaa . 
docker run --rm -it -p 3000:3000 robust-aaa 
```