#!/bin/bash
#
#	Start the application in a Docker server.
#
#	We don't want to hard code the deployment configuration into
#	the Docker container, so instead we copy environment.js from
#	the volume for the server before running the server.
#
echo ""
echo "start_inside_docker_container.sh"
echo "--------------------------------"
echo JUICE_CONFIG=${JUICE_CONFIG}
echo WEBSITE_PORT=${WEBSITE_PORT}
echo "$" cd /server
         cd /server

echo "Starting the server using pm2..."
echo "$" exec pm2-runtime src/server.js --node-args="-r esm"
         exec pm2-runtime src/server.js --node-args="-r esm"
