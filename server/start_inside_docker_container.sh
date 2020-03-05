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

#echo "Installing environment.js..."
#echo "$" cp ${SERVER_HOME}/config/environment.js /src/public/assets/scripts/environment.js
#         cp ${SERVER_HOME}/config/environment.js /src/public/assets/scripts/environment.js

echo "Starting the server using pm2..."
#echo "$" exec pm2 start pm2.json --no-daemon --node-args="-r esm"
#         exec pm2 start pm2.json --no-daemon --node-args="-r esm"
echo "$" exec pm2-runtime src/server.js --node-args="-r esm"
         exec pm2-runtime src/server.js --node-args="-r esm"

#docker run -it --link test-mysql:mysql --rm mysql sh -c 'exec mysql -h"$MYSQL_PORT_3306_TCP_ADDR" -P"$MYSQL_PORT_3306_TCP_PORT" -uroot -p"$MYSQL_ENV_MYSQL_ROOT_PASSWORD"'
#/opt/Development/Projects/juice/juiceconfig-config/local-server/volumes/juice/config/config-for-juice.json