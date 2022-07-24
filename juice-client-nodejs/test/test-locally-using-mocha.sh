#d!b/in/sh

     export JUICE_CONFIG=file:::`pwd`/mocha-cli-config.json
echo export JUICE_CONFIG=${JUICE_CONFIG}
#
#	If files are specified, run just those tests
#
if [ "$#" != 0 ] ; then
	echo mocha $*
	     mocha $*
else
	echo mocha mocha-cli-tests
	     mocha mocha-cli-tests
fi
