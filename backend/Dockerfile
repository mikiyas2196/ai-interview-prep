FROM php:8.2-cli

# Install system dependencies and SQLite/zip extensions
RUN apt-get update && apt-get install -y \
    libsqlite3-dev \
    zip \
    unzip \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev

RUN docker-php-ext-install pdo pdo_sqlite mbstring bcmath gd

# Get Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . /app

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Ensure storage directory permissions
RUN chmod -R 777 storage bootstrap/cache database

EXPOSE 8000

CMD ["sh", "/app/start.sh"]
