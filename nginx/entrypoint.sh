#!/bin/sh
echo "Entrypoint script is running"
envsubst '$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
cat /etc/nginx/conf.d/default.conf # Check the substituted config
exec nginx -g 'daemon off;'
