# See https://semaphoreci.com/community/tutorials/dockerizing-a-node-js-web-application
FROM node:latest
USER root

# Temporarily install vim (while debugging)
RUN apt-get update
RUN apt-get install -y vim

# Change this to force rebuild
RUN echo 1

# Install pm2 so we can run our application
RUN yarn global add pm2

# Get the package definitions for server and website
COPY server/package.json /server/package.json
COPY website/package.json /website/package.json

# Install npm modules first, for the server
WORKDIR /server
RUN rm -rf node_modules
#RUN npm --color false install
RUN yarn install

# Install npm modules first, for the website
WORKDIR /website
RUN rm -rf node_modules
#RUN npm --color false install
RUN yarn install

#COPY website/package.json /website/package.json
#WORKDIR /website
#RUN rm -rf node_modules
#RUN npm --color false install

# Now install the source for the server
WORKDIR /server
ADD server /server
RUN yarn install


# Now generate the website
WORKDIR /website
ADD website /website
RUN yarn generate

# Tidy up

# Install the secure configuration files
#ADD secure-config /secure-config

# Show stuff
#RUN find /secure-config -type f
#RUN ls -l /website
#RUN ls -l /src/public

# Overlay any required config files onto /website
#WORKDIR /website
#RUN cp -R /secure-config/Config/website/overlay/* /website

# Hack to fix vue-blu / bulma bug.
# See https://github.com/tooltwist/a3/issues/3
#RUN sed -i 's!"bulma": "^0.2.3",!"bulma": "^0.6.1",!' node_modules/vue-blu/package.json
#RUN rm -rf package-lock.json node_modules/bulma/
#RUN npm --color false install

# Build the website and install the Webpack'd files
#RUN npm run build
#RUN npm run generate
#RUN cp -R dist/* /src/public

# Add a version file
#RUN echo $CODEBUILD_RESOLVED_SOURCE_VERSION > /src/public/version.html

# Run the app with pm2 to ensure server restart on exceptions.
EXPOSE  4000
CMD ["/bin/bash", "/server/start_inside_docker_container.sh"]
