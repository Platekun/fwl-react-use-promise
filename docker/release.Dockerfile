FROM node:16-alpine

RUN npm install -g npm@8.5.3

ENV TERM xterm-256color

ARG NPM_AUTH_TOKEN

WORKDIR /fwl-react-use-promise

COPY ./library .

RUN echo "//registry.npmjs.org/:_authToken=${NPM_AUTH_TOKEN}" > .npmrc

RUN if [[ -f "package-lock.json" ]] ; then npm ci --silent ; else npm install ; fi

RUN npm run build

CMD ["npm", "run", "release"]