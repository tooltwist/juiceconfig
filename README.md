# juiceconfig
Juice configuration assistance




This repository contains multiple sub-projects:

* Language-specific libraries to allow applications to access configurations. These libraries allow a program to seamlessly
switch between configuration sources (e.g. Flat Files, and Amazon Secrets Manager).

* The client library `juice-client-nodejs` also provides a CLI (command line interface)
for updating config files in a production environment.

* `juice-spa` and `juice-api` provide a web-based tool for defining applications,
their dependancies, and the environments in which they run. This tool may be accessed publicly
at http://juiceconfig.com, or can be run privately inhouse from an Open Source Docker image.

For more details, see https://juiceconfig.io


## juice-client-nodejs

``` bash
# install dependencies
$ yarn install

# test the command line interface
$ yarn test-cli

# publish a 'dot release' version to npm
$ yarn patch-release
```


## juice-client-go
(coming soon)  

## juice-client-java
(coming soon)  
 

## website
This is the frontend of the juice configuration tool.

``` bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start

# generate static project
$ yarn generate

# run tests
$ yarn test
```

## server
This is the backend of the juice configuration tool.

``` bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start

# generate static project
$ yarn generate
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).
