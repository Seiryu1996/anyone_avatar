FROM php:8.2-fpm

# 作業ディレクトリ
WORKDIR /var/www

# 依存関係のインストール
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev \
    zip \
    unzip \
    libzip-dev \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libwebp-dev \
    && pecl install redis \
    && docker-php-ext-enable redis

# PHP拡張のインストール
RUN docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath zip

# GD拡張のインストール（画像処理用）
RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install gd

# OPcacheのインストール
RUN docker-php-ext-install opcache

# Composerのインストール
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

RUN mkdir -p /var/log/php-fpm && \
    touch /var/log/php-fpm/www-slow.log && \
    chown -R www-data:www-data /var/log/php-fpm && \
    chmod -R 755 /var/log/php-fpm

# PHP-FPM設定をコピー
COPY docker/php/www.conf /usr/local/etc/php-fpm.d/www.conf
COPY docker/php/php.ini /usr/local/etc/php/php.ini

# ユーザーの作成
RUN groupadd -g 1000 www
RUN useradd -u 1000 -ms /bin/bash -g www www

# ディレクトリの所有者を変更
COPY --chown=www:www . /var/www

# ユーザーを切り替え
USER www

EXPOSE 9000
CMD ["php-fpm"]
