<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400"></a></p>

<p align="center">
<a href="https://travis-ci.org/laravel/framework"><img src="https://travis-ci.org/laravel/framework.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Protected user UI

Purpose of Protected user UI is to manage user By SGS 2-tier application

Requirment PHP 7.3 node 8x

Steps to install

- clone project from git or download
- npm install
- npm run start
- got to backend/api directory
- copy .env-example file into .env
- run composer install

create .htaccess file in backend folder

########################
RewriteEngine on
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

RewriteCond %{REQUEST_URI} ^/api/
RewriteRule (.*) api/public/index.php [L]

RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . index.html [L]
#######################


Create Virtual host 

<VirtualHost *:80>
    ServerName pro-user
    ServerAlias pro-user
    DocumentRoot "/var/www/html/htdocs/pro-user/public"
    Options Indexes FollowSymLinks
    <Directory "/var/www/html/htdocs/pro-user/public">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>


