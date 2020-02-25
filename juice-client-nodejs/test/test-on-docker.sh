#!/bin/bash

TAG=juice-client-test

echo ''
echo '#############################################'
echo '             Build Docker image'
echo '#############################################'
docker build -t ${TAG} .
[ $? != 0 ] && exit


echo ''
echo ''
echo '#############################################'
echo '              Run Docker image'
echo '#############################################'
docker run --rm ${TAG}
[ $? != 0 ] && exit
