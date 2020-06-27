#d!b/in/sh

echo export JUICE_CONFIG=file:::/opt/Development/Projects/juice/juiceconfig-config/local-server/volumes/juice-client/mocha-test-data.json
     export JUICE_CONFIG=file:::/opt/Development/Projects/juice/juiceconfig-config/local-server/volumes/juice-client/mocha-test-data.json

#
#	If files are specified, run just those tests
#
if [ "$#" != 0 ] ; then
	mocha $*
else
	mocha mocha-cli-tests
fi
