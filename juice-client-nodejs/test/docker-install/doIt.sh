#!/bin/sh

export JUICE_CONFIG='file:::/docker-install/config.json'
CMD=/juice-client/node_modules/\@tooltwist/juice-client/lib/juice-cli
errorStatus=0

function checkType {
  path=$1
  type=$2
  #echo checkType $1 $2
  #echo "Checking type of ${path}"
  #file $1
  str=$(file $1 | sed 's/^.* //')
  #echo STR=${str}
  if [ "${str}" != "${type}" ] ; then
    echo "- ERROR: incorrect type (${str}, expected ${type})"
    errorStatus=1
  else
    echo "- type is correct (${type})"
  fi
}

function checkContains {
  path=$1
  pattern=$2
  #echo checkType $1 $2
  #echo "Checking ${path} contains string (${pattern})"
  if grep "${pattern}" ${path} > /dev/null ; then
    echo "- pattern found (${pattern})"
  else
    echo "- ERROR: pattern not found (${pattern})"
    errorStatus=1
  fi
}

function checkFile {
  path=$1; shift
  type=$1; shift
  echo ''
  echo "Checking $path"
  checkType "${path}" "${type}"
  while [ "$1" != "" ] ; do
    #echo Check pattern $1
    pattern=$1; shift
    checkContains "${path}" "${pattern}"
  done
}

# Create entire directory
#${CMD} install template generated-files-1

# Copy individual files to directory
echo ''
echo '####  Install individual files (to directory generated-files-2)'
mkdir generated-files-2
node ${CMD} install template/junk.binary generated-files-2
node ${CMD} install template/junk.json generated-files-2
node ${CMD} install template/junk.txt generated-files-2
node ${CMD} install template/junk.txt.zip generated-files-2
node ${CMD} install template/junk.utf8 generated-files-2


# Copy individual files to specific locations
echo ''
echo '####  Install individual files (to directory generated-files-3)'
mkdir generated-files-3
node ${CMD} install template/junk.binary generated-files-3/binary
node ${CMD} install template/junk.json generated-files-3/jsonish
node ${CMD} install template/junk.txt generated-files-3/textual
node ${CMD} install template/junk.txt.zip generated-files-3/zippy
node ${CMD} install template/junk.utf8 generated-files-3/unicodish

# Convert directory inplace
echo ''
echo '####  In-place conversion'
echo '(not yet)'
cp -R test/template inplace-config
#${CMD} inplace inplace-config

echo ''
echo ''
echo '####  Check the results'
checkFile generated-files-2/junk.binary data 'port: 56911'
checkFile generated-files-2/junk.json text '"name": "juice"' '"port": "56911"'
checkFile generated-files-2/junk.txt text '"name": "juice"' '"port": "56911"'
checkFile generated-files-2/junk.txt.zip extract
checkFile generated-files-2/junk.utf8 text '"name": "juice"' '"port": "56911"'

checkFile generated-files-3/binary data 'port: 56911'
checkFile generated-files-3/jsonish text '"name": "juice"' '"port": "56911"'
checkFile generated-files-3/textual text '"name": "juice"' '"port": "56911"'
checkFile generated-files-3/zippy extract
checkFile generated-files-3/unicodish text '"name": "juice"' '"port": "56911"'


#
# Perhaps show debug
#
DEBUG=N
if [ "${DEBUG}" == "Y" ] ; then
  echo ''
  echo ''
  echo '####  Files installed'
  pwd
  ls -lR gen*
  echo ''
  echo You can check these files with the following command...
  echo '# docker run -it --rm juice-client-test /bin/bash'
  echo ''
fi

if [ ${errorStatus} != 0 ] ; then
  echo
  echo "Warning: Errors were detected."
  echo
else
  echo
  echo "Conversions appear to be correct."
  echo
fi
exit ${errorStatus}
