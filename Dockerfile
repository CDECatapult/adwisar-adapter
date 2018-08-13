#-------------------------------------------------------------------------------
FROM node:8.11.3-alpine AS base

WORKDIR /adwisar-adapter

#-------------------------------------------------------------------------------
FROM base AS dependencies

COPY package-lock.json .
COPY package.json .
RUN npm install

#-------------------------------------------------------------------------------
FROM dependencies AS build

COPY app app
COPY adwisar-samples adwisar-samples
COPY .eslintrc.json .
COPY .prettierrc .
COPY test.js .

RUN npm run lint
RUN npm run test

#-------------------------------------------------------------------------------
FROM base AS release

COPY --from=dependencies /adwisar-adapter/package-lock.json .
COPY --from=dependencies /adwisar-adapter/package.json .
RUN npm install --production

COPY --from=build /adwisar-adapter/app app

CMD ["node", "."]
