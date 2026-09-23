#!/bin/sh

# Ensure database directory and sqlite file exist with full write permissions
mkdir -p /app/database
touch /app/database/database.sqlite
chmod -R 777 /app/database /app/storage /app/bootstrap/cache

# Run database migrations
php artisan migrate --force

# Start Laravel server
PORT="${PORT:-8000}"
php artisan serve --host=0.0.0.0 --port=$PORT
