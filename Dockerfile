# =========================================================================
# Stage 1: Build Frontend Assets
# =========================================================================
FROM node:22-alpine AS frontend-builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY resources/ resources/
COPY vite.config.js postcss.config.js tailwind.config.js* ./
COPY public/ public/

RUN npm run build

# =========================================================================
# Stage 2: Install Composer Dependencies
# =========================================================================
FROM composer:2 AS vendor-builder
WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --no-autoloader \
    --no-scripts

COPY app/ app/
COPY bootstrap/ bootstrap/
COPY config/ config/
COPY database/ database/
COPY routes/ routes/

RUN composer dump-autoload --optimize --no-dev

# =========================================================================
# Stage 3: Production Runtime
# =========================================================================
FROM php:8.4-cli-alpine AS runtime

# Install php extension installer
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/

# Install required PHP extensions
RUN install-php-extensions \
    pdo_sqlite \
    sqlite3 \
    gd \
    intl \
    zip \
    bcmath \
    pcntl \
    opcache

WORKDIR /app

# Copy application files
COPY . .

# Copy built vendor and public assets from builder stages
COPY --from=vendor-builder /app/vendor /app/vendor
COPY --from=frontend-builder /app/public/build /app/public/build

# Copy and configure entrypoint
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint
RUN chmod +x /usr/local/bin/docker-entrypoint

# Create storage and database directories with write permissions
RUN mkdir -p /app/database /app/storage/framework/cache /app/storage/framework/sessions /app/storage/framework/views /app/storage/logs /app/bootstrap/cache \
    && chmod -R 775 /app/storage /app/bootstrap/cache /app/database

ENV APP_ENV=production
ENV APP_DEBUG=false
ENV PORT=8080

EXPOSE 8080

ENTRYPOINT ["docker-entrypoint"]
