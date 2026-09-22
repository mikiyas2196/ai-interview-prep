#!/bin/sh

# Ensure SQLite database exists
touch /app/database/database.sqlite
chmod 777 /app/database/database.sqlite

# Run migrations
php artisan migrate --force

# Start Laravel production server listening on $PORT or default 8000
PORT="${PORT:-8000}"
php artisan serve --host=0.0.0.0 --port=$PORT
