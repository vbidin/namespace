FROM node:alpine

RUN apk update && apk upgrade
RUN apk add --no-cache curl git make g++ python3 py3-pip

WORKDIR /app
COPY package.json yarn.lock .
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

CMD ["/bin/sh"]
