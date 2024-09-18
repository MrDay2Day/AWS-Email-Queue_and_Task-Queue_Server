echo "Payload received: $*" >> /usr/src/app/deploy.log
echo "Webhook triggered at $(date)" >> /usr/src/app/deploy.log

set -o allexport
source .env
set +o allexport

echo "Redeploy triggered at $(date)" >> /usr/src/app/deploy.log

./docker.sh scale

echo "Redeployment finished at $(date)" >> /usr/src/app/deploy.log