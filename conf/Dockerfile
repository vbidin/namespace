FROM node:alpine
WORKDIR app

RUN apk update && apk upgrade
RUN apk add --no-cache curl git make g++ python3 py3-pip

COPY package.json yarn.lock .
RUN yarn install --frozen-lockfile

COPY conf/ conf/
COPY src/ src/
COPY test/ test/
RUN yarn build

ENTRYPOINT ["/bin/sh"]
