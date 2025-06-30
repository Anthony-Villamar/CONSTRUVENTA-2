# Usa la imagen oficial de PHP con Apache
FROM php:8.2-apache

# Instala extensiones necesarias de PHP para Laravel y MySQL
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    git \
    curl \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Instala Composer globalmente
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configura el directorio de trabajo
WORKDIR /var/www/html

# Copia todos los archivos al contenedor
COPY . .

# Instala dependencias de Laravel
RUN composer install --no-interaction --prefer-dist --optimize-autoloader

# Da permisos a storage y bootstrap/cache
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Expone el puerto 80
EXPOSE 80

# Comando para iniciar Apache en primer plano
CMD ["apache2-foreground"]
