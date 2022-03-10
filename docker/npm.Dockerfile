FROM node:16-alpine

# 💡 https://stackoverflow.com/questions/40944479/docker-how-to-use-bash-with-an-alpine-based-docker-image
RUN apk update && apk add bash

RUN npm install -g npm@8.5.3

ENV TERM xterm-256color

WORKDIR /fwl-react-use-promise

COPY ./library .

ENTRYPOINT ["/bin/bash", "-c", "npm ${@}", "--"];
