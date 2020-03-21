#!/bin/bash
#
#	When this server is deployed inside a Docker
#	container, this is the script that fires it up.
#
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
GENERATE_CONFIG=N
if [ "${GENERATE_CONFIG}" == "Y" ] ; then
    TEMPLATE_CONFIG_DIRECTORY=test/template/
    GENERATED_CONFIG_DIRECTORY=generated-config-directory
    GENERATED_CONFIG_FILE=generated-config-file.txt
    CMD=node_modules/\@tooltwist/juice-client/bin/juice-cli.js
    echo "Generate a config directory..."
    echo node ${CMD} install ${TEMPLATE_CONFIG_DIRECTORY} ${GENERATED_CONFIG_DIRECTORY}
         node ${CMD} install ${TEMPLATE_CONFIG_DIRECTORY} ${GENERATED_CONFIG_DIRECTORY}
    echo "Generate a config file..."
    echo node ${CMD} install ${TEMPLATE_CONFIG_DIRECTORY}/junk.txt ${GENERATED_CONFIG_FILE}
         node ${CMD} install ${TEMPLATE_CONFIG_DIRECTORY}/junk.txt ${GENERATED_CONFIG_FILE}
fi

echo "Starting the server using pm2..."
echo "$" exec pm2-runtime src/server.js --node-args="-r esm"
         exec pm2-runtime src/server.js --node-args="-r esm"
