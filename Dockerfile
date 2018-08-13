#-------------------------------------------------------------------------------
FROM node:8.11.3-alpine AS base

WORKDIR /dfki-adapter

#-------------------------------------------------------------------------------
FROM base AS dependencies

COPY package-lock.json .
COPY package.json .
RUN npm install

#-------------------------------------------------------------------------------
FROM dependencies AS build

COPY app app
COPY dfki-samples dfki-samples
COPY .eslintrc.json .
COPY .prettierrc .
COPY test.js .

RUN npm run lint
RUN npm run test

#-------------------------------------------------------------------------------
FROM base AS release

COPY --from=dependencies /dfki-adapter/package-lock.json .
COPY --from=dependencies /dfki-adapter/package.json .
RUN npm install --production

COPY --from=build /dfki-adapter/app app

CMD ["node", "."]
