###############################################################################
# Test image                                                                 #
###############################################################################
FROM node:8.11.3-alpine

# Allow log level to be controlled. Uses an argument name that is different
# from the existing environment variable, otherwise the environment variable
# shadows the argument.
ARG LOGLEVEL
ENV NPM_CONFIG_LOGLEVEL ${LOGLEVEL}

# Copy jq script that can generate package.json files from package-lock.json
# files.
WORKDIR /dfki-adapter

# Install base dependencies
COPY . .
RUN npm install --production

EXPOSE 6000
CMD ["npm", "start"]
