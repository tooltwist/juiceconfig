#!/bin/bash
#
#	When this server is deployed inside a Docker
#	container, this is the script that fires it up.
#
    # Here we are
echo ""
echo "start_inside_docker_container.sh"
echo "--------------------------------"
echo JUICE_CONFIG=${JUICE_CONFIG}
#echo WEBSITE_PORT=${WEBSITE_PORT}
echo "$" cd /server
         cd /server

# Generate the config directory from a template directory
# Ideally, an application will include the juice-client library and
# access configuration values directly. Some environments however
# require specific config files in specific locations (e.g. Tomcat),
# and the following code has the ability to generate those config
# files from a configuration template directory or file.
GENERATE_CONFIG=Y
if [ "${GENERATE_CONFIG}" == "Y" ] ; then

    #
    # Do $JUICE{...} substitution wherever required in the dist directory.
    #
    CMD=node_modules/\@tooltwist/juice-client/bin/juice-cli.js
    for filename in $(grep -rl '\$JUICE{' /website/dist/) ; do
        echo Converting ${filename}
        newfile=${filename}-replacement-file
        origfile=${filename}-original-file
        node ${CMD} install ${filename} ${newfile}
        mv ${filename} ${origfile}
        mv ${newfile} ${filename}
    done
fi

echo "Starting the server using pm2..."
echo "$" exec pm2-runtime src/server.js --node-args="-r esm"
         exec pm2-runtime src/server.js --node-args="-r esm"
