#
#	Useful functions
#

# Colors
# See https://stackoverflow.com/questions/5947742/how-to-change-the-output-color-of-echo-in-linux
RED="\033[0;31m"
BLUE="\033[1;34m"
BROWN="\033[0;34m"
GREEN="\033[0;32m"
NC="\033[0m" # No Color

function heading {
	heading=$*
	echo -e ${BLUE}
	echo ""
	echo "= $heading..."
	echo -e ${NC}
}

function run {
	cmd=$*
	echo ""
	echo -e ${BROWN} "$" $cmd ${NC}
	echo ""
	$cmd
	if [ $? != 0 ]; then
		die
	fi
}

function die {
	echo -e ${RED}
	echo "-----------------------------------------------"
	echo "ERROR  ERROR  ERROR  ERROR  ERROR  ERROR  ERROR"
	echo "-----------------------------------------------"
	echo ""
	echo "    This command DID NOT complete correctly."
	echo ""
	echo "-----------------------------------------------"
	echo -e ${NC}
	exit 1
}
