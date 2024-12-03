#!/bin/bash

source ./.env

# Define a function to bring services up
docker-prod() {
    echo "Starting Production services clean..."
    docker compose -f docker-compose-prod.yml down --volumes --rmi all --remove-orphans
    docker compose -f docker-compose-prod.yml --build --no-cache
    docker compose -f docker-compose-prod.yml up -d
    echo "Production services started -> ts-node."
}

docker-dev() {
    echo "Starting Development services..."
    docker compose -f docker-compose-dev.yml down --volumes --rmi all --remove-orphans
    docker compose -f docker-compose-dev.yml --build --no-cache
    docker compose -f docker-compose-dev.yml up -d
    echo "Development started -> ts-node-dev."
}
docker-dev-node() {
    echo "Starting Development services..."
    docker compose -f docker-compose-dev-node.yml down --volumes --rmi all --remove-orphans
    docker compose -f docker-compose-dev-node.yml --build --no-cache
    docker compose -f docker-compose-dev-node.yml up -d
    echo "Development started -> node."
}
docker-remove() {
    echo "Remove all versions and services..."
    docker compose -f docker-compose-dev.yml down --volumes --rmi all --remove-orphans
    docker compose -f docker-compose-dev-node.yml down --volumes --rmi all --remove-orphans
    docker compose -f docker-compose-prod.yml down --volumes --rmi all --remove-orphans
    docker compose -f docker-compose-prod-scale.yml down --volumes --rmi all --remove-orphans
    echo "All Docker data removed"
}

# PM2 
pm2-deploy(){
    echo "Deploying $APP_NAME PM2"
    npx pm2 start pm2.config.js
    echo "PM2 Deployment successful -> $APP_NAME"
}
pm2-restart(){
    echo "Deploying $APP_NAME PM2"
    npx pm2 restart $APP_NAME
    echo "PM2 Deployment restart successful -> $APP_NAME"
}
pm2-kill(){
    echo "Stopping $APP_NAME PM2"
    npx pm2 kill
    echo "PM2 Successfully stopped -> $APP_NAME"
}

# Check for the first argument to determine which function to run
case "$1" in
    docker-dev)
        docker-dev
        ;;
    # docker-dev-node)
    #     docker-dev-node
    #     ;;
    docker-remove)
        docker-remove
        ;;
    docker-prod)
        docker-prod
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
        echo "Expected Input for Docker - 'docker-dev' | 'docker-dev-node' | 'docker-remove' | 'docker-clean' | 'docker-prod' | 'docker-prod-up'"
        echo "Expected Input for PM2 - 'pm2-deploy' | 'pm2-restart' | 'pm2-stop'"
        exit 1
        ;;
esac
