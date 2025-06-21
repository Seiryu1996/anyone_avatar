#!/bin/bash

# Composer install
docker-compose exec app composer install

# Laravel setup
docker-compose exec app php artisan install:api
docker-compose exec app php artisan migrate
docker-compose exec app php artisan optimize

# Permissions
docker-compose exec app chmod -R 777 /var/www

# NPM
docker-compose exec node npm install
docker-compose exec node npm run build

echo "✅ 完了"
