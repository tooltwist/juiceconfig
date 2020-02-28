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
echo SERVER_HOME=${SERVER_HOME}
echo WEBSITE_PORT=${WEBSITE_PORT}
echo "$" cd /server
         cd /server

#echo "Installing environment.js..."
#echo "$" cp ${SERVER_HOME}/config/environment.js /src/public/assets/scripts/environment.js
#         cp ${SERVER_HOME}/config/environment.js /src/public/assets/scripts/environment.js

echo "Starting the server using pm2..."
echo "$" exec pm2 start pm2.json --no-daemon
         exec pm2 start pm2.json --no-daemon
