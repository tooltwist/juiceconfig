# See https://semaphoreci.com/community/tutorials/dockerizing-a-node-js-web-application
FROM node:latest
USER root

# Temporarily install vim (while debugging)
RUN apt-get update
RUN apt-get install -y vim

# Change this to prevent using cached install of juice-client
RUN echo 12345

# Install juice-client
RUN mkdir /juice-client
WORKDIR /juice-client
RUN echo {} > package.json
RUN npm install --color false @tooltwist/juice-client --save

# Install files required for testing
COPY docker-install /docker-install
COPY template /docker-install/template
WORKDIR /docker-install

#
# The following script converts configuration files
# then performs any activities required by the app.
#
CMD ["bash", "/docker-install/doIt.sh"]
