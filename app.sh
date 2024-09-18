#!/bin/bash

source ./.env

# Define a function to bring services up
docker-prod() {
    echo "Starting Production services clean..."
    docker-compose -f docker-compose-prod.yml down --volumes --rmi all --remove-orphans
    docker-compose -f docker-compose-prod.yml --build --no-cache
    docker-compose -f docker-compose-prod.yml up -d
    echo "Production services started."
}
docker-scale() {
    echo "Starting Production services with scaling..."
    docker-compose -f docker-compose-prod-scale.yml down --volumes --rmi all --remove-orphans
    docker-compose -f docker-compose-prod-scale.yml --build --no-cache
    docker-compose -f docker-compose-prod-scale.yml up -d --scale node-server=$CLUSTER_SIZE
    echo "Production Container deployed with $CLUSTER_SIZE node(s)."
}
docker-dev() {
    echo "Starting Development services..."
    docker-compose -f docker-compose-dev.yml down --volumes --rmi all --remove-orphans
    docker-compose -f docker-compose-dev.yml --build --no-cache
    docker-compose -f docker-compose-dev.yml up -d
    echo "Development started."
}
docker-dev-node() {
    echo "Starting Development services..."
    docker-compose -f docker-compose-dev-node.yml down --volumes --rmi all --remove-orphans
    docker-compose -f docker-compose-dev-node.yml --build --no-cache
    docker-compose -f docker-compose-dev-node.yml up -d
    echo "Development started."
}
docker-remove() {
    echo "Remove all versions and services..."
    docker-compose -f docker-compose-dev.yml down --volumes --rmi all --remove-orphans
    docker-compose -f docker-compose-dev-node.yml down --volumes --rmi all --remove-orphans
    docker-compose -f docker-compose-prod.yml down --volumes --rmi all --remove-orphans
    docker-compose -f docker-compose-prod-scale.yml down --volumes --rmi all --remove-orphans
    echo "All data removed"
}

# PM2 
pm2-deploy(){
    echo "Deploying $APP_NAME PM2 Cluster - Nodes $CLUSTER_SIZE"
    npx pm2 start pm2.config.js
    echo "Deployment successful $APP_NAME:$CLUSTER_SIZE"
}
pm2-restart(){
    echo "Deploying $APP_NAME PM2 Cluster - Nodes $CLUSTER_SIZE"
    npx pm2 restart $APP_NAME
    echo "Deployment successful $APP_NAME:$CLUSTER_SIZE"
}
pm2-kill(){
    echo "Stopping $APP_NAME:$CLUSTER_SIZE PM2 Cluster"
    npx pm2 kill
    echo "Successfully stopped $APP_NAME:$CLUSTER_SIZE"
}

# Check for the first argument to determine which function to run
case "$1" in
    docker-dev)
        docker-dev
        ;;
    dev-docker-node)
        dev-docker-node
        ;;
    docker-remove)
        docker-remove
        ;;
    docker-prod)
        docker-prod
        ;;
    docker-scale)
        docker-scale
        ;;

    # PM2
    pm2-deploy)
        pm2-deploy
        ;;
    pm2-restart)
        pm2-restart
        ;;
    pm2-stop)
        pm2-kill
        ;;
    *)
        echo "Invalid Input: '$1'"
        echo "Expected Input for Docker - 'docker-dev' | 'docker-dev-node' | 'docker-remove' | 'docker-clean' | 'docker-prod' | 'docker-prod-up' | 'docker-scale' "
        echo "Expected Input for PM2 - 'pm2-deploy' | 'pm2-restart' | 'pm2-stop'"
        exit 1
        ;;
esac
