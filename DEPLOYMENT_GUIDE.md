# Ticketing System Deployment Guide

Complete step-by-step guide to deploy Laravel backend and React frontend on a VPS with Nginx.

---

## Prerequisites

- Ubuntu/Debian VPS with root access
- Domain name pointed to your VPS IP (e.g., example.com)
- SSH access to your server

---

## Server Setup

### 1. Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Required Software

```bash
# Install Nginx
sudo apt install nginx -y

# Install PHP 8.2 and extensions
sudo apt install php8.2-fpm php8.2-cli php8.2-common php8.2-mysql php8.2-zip php8.2-gd php8.2-mbstring php8.2-curl php8.2-xml php8.2-bcmath php8.2-sqlite3 -y

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer

# Install Node.js 20.x and npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y

# Install MySQL (optional, if not using SQLite)
sudo apt install mysql-server -y
```

### 3. Configure Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## Backend Deployment (Laravel)

### 1. Clone Repository

```bash
cd /var/www
sudo mkdir -p ticketing-system
sudo chown -R $USER:$USER ticketing-system
cd ticketing-system

# Clone your repository
git clone <your-repo-url> backend
cd backend
```

### 2. Install Dependencies

```bash
composer install --optimize-autoloader --no-dev
```

### 3. Configure Environment

```bash
# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env
```

**Update these variables in `.env`:**

```env
APP_NAME="Support Ticketing"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.example.com

# Database (SQLite)
DB_CONNECTION=sqlite
# DB_DATABASE=/var/www/ticketing-system/backend/database/database.sqlite

# OR MySQL
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=ticketing_db
# DB_USERNAME=ticketing_user
# DB_PASSWORD=your_secure_password

# Sanctum
SANCTUM_STATEFUL_DOMAINS=example.com
SESSION_DOMAIN=.example.com

# Frontend URL
FRONTEND_URL=https://example.com

# Pusher (if using real-time features)
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=your_app_id
PUSHER_APP_KEY=your_app_key
PUSHER_APP_SECRET=your_app_secret
PUSHER_APP_CLUSTER=your_cluster
```

### 4. Setup Database

```bash
# For SQLite
touch database/database.sqlite
chmod 664 database/database.sqlite

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate --force

# Create storage link
php artisan storage:link

# Optimize Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 5. Set Permissions

```bash
sudo chown -R www-data:www-data /var/www/ticketing-system/backend
sudo chmod -R 755 /var/www/ticketing-system/backend
sudo chmod -R 775 /var/www/ticketing-system/backend/storage
sudo chmod -R 775 /var/www/ticketing-system/backend/bootstrap/cache
```

### 6. Configure Nginx for Backend

```bash
sudo nano /etc/nginx/sites-available/api.example.com
```

**Add this configuration:**

```nginx
server {
    listen 80;
    server_name api.example.com;
    root /var/www/ticketing-system/backend/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    client_max_body_size 10M;
}
```

**Enable site:**

```bash
sudo ln -s /etc/nginx/sites-available/api.example.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Frontend Deployment (React + Vite)

### 1. Clone Frontend

```bash
cd /var/www/ticketing-system
git clone <your-repo-url> frontend
cd frontend
```

### 2. Configure Environment

```bash
# Create environment file
nano .env
```

**Add these variables:**

```env
VITE_API_URL=https://api.example.com/api
VITE_PUSHER_APP_KEY=your_app_key
VITE_PUSHER_APP_CLUSTER=your_cluster
```

### 3. Install Dependencies and Build

```bash
npm install
npm run build
```

This creates an optimized production build in the `dist` folder.

### 4. Configure Nginx for Frontend

```bash
sudo nano /etc/nginx/sites-available/example.com
```

**Add this configuration:**

```nginx
server {
    listen 80;
    server_name example.com www.example.com;
    root /var/www/ticketing-system/frontend/dist;

    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
}
```

**Enable site:**

```bash
sudo ln -s /etc/nginx/sites-available/example.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## SSL Certificate (Let's Encrypt)

### 1. Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Obtain SSL Certificates

```bash
# For backend API
sudo certbot --nginx -d api.example.com

# For frontend
sudo certbot --nginx -d example.com -d www.example.com
```

Certbot will automatically configure Nginx for HTTPS and set up auto-renewal.

---

## Post-Deployment Setup

### 1. Create Admin User

```bash
cd /var/www/ticketing-system/backend
php artisan tinker
```

In tinker console:

```php
$admin = new App\Models\User();
$admin->name = 'Admin User';
$admin->email = 'admin@example.com';
$admin->password = bcrypt('your_secure_password');
$admin->role = 'admin';
$admin->email_verified_at = now();
$admin->save();
exit;
```

### 2. Setup Cron Jobs (Optional - for scheduled tasks)

```bash
sudo crontab -e
```

Add this line:

```
* * * * * cd /var/www/ticketing-system/backend && php artisan schedule:run >> /dev/null 2>&1
```

### 3. Setup Queue Worker (Optional - for background jobs)

Create supervisor configuration:

```bash
sudo nano /etc/supervisor/conf.d/ticketing-queue.conf
```

Add:

```ini
[program:ticketing-queue]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/ticketing-system/backend/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/var/www/ticketing-system/backend/storage/logs/worker.log
stopwaitsecs=3600
```

Start supervisor:

```bash
sudo apt install supervisor -y
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start ticketing-queue:*
```

---

## Updating the Application

### Backend Updates

```bash
cd /var/www/ticketing-system/backend

# Pull latest changes
git pull origin main

# Install dependencies
composer install --optimize-autoloader --no-dev

# Run migrations
php artisan migrate --force

# Clear and rebuild cache
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Restart PHP-FPM
sudo systemctl restart php8.2-fpm
```

### Frontend Updates

```bash
cd /var/www/ticketing-system/frontend

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build production assets
npm run build

# No need to restart anything - static files are updated
```

---

## Troubleshooting

### Check Nginx Error Logs

```bash
sudo tail -f /var/log/nginx/error.log
```

### Check Laravel Logs

```bash
sudo tail -f /var/www/ticketing-system/backend/storage/logs/laravel.log
```

### Fix Permission Issues

```bash
cd /var/www/ticketing-system/backend
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

### Test PHP-FPM

```bash
sudo systemctl status php8.2-fpm
sudo systemctl restart php8.2-fpm
```

### Test Nginx Configuration

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Clear All Caches

```bash
cd /var/www/ticketing-system/backend
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

---

## Security Best Practices

1. **Change default passwords** for database and admin users
2. **Keep system updated**: `sudo apt update && sudo apt upgrade -y`
3. **Use strong passwords** for all accounts
4. **Enable firewall**: Only allow necessary ports (22, 80, 443)
5. **Regular backups**: Backup database and uploaded files regularly
6. **Monitor logs**: Check error logs periodically
7. **Keep dependencies updated**: Run `composer update` and `npm update` regularly
8. **Disable directory listing** in Nginx (already configured)
9. **Use environment variables** - never commit `.env` files
10. **Enable rate limiting** in Laravel for API endpoints

---

## Backup Strategy

### Database Backup (SQLite)

```bash
# Backup SQLite database
cp /var/www/ticketing-system/backend/database/database.sqlite /var/backups/database-$(date +%Y%m%d).sqlite
```

### Database Backup (MySQL)

```bash
# Backup MySQL database
mysqldump -u ticketing_user -p ticketing_db > /var/backups/database-$(date +%Y%m%d).sql
```

### Uploaded Files Backup

```bash
# Backup storage folder
tar -czf /var/backups/storage-$(date +%Y%m%d).tar.gz /var/www/ticketing-system/backend/storage/app/public
```

### Automated Daily Backups

Create backup script:

```bash
sudo nano /usr/local/bin/backup-ticketing.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/ticketing"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
cp /var/www/ticketing-system/backend/database/database.sqlite $BACKUP_DIR/db-$DATE.sqlite

# Backup uploads
tar -czf $BACKUP_DIR/storage-$DATE.tar.gz /var/www/ticketing-system/backend/storage/app/public

# Keep only last 7 days of backups
find $BACKUP_DIR -type f -mtime +7 -delete
```

Make executable and add to cron:

```bash
sudo chmod +x /usr/local/bin/backup-ticketing.sh
sudo crontab -e
```

Add line:

```
0 2 * * * /usr/local/bin/backup-ticketing.sh
```

---

## Performance Optimization

### Enable OPcache

```bash
sudo nano /etc/php/8.2/fpm/php.ini
```

Add/uncomment:

```ini
opcache.enable=1
opcache.memory_consumption=128
opcache.interned_strings_buffer=8
opcache.max_accelerated_files=10000
opcache.revalidate_freq=2
```

Restart PHP-FPM:

```bash
sudo systemctl restart php8.2-fpm
```

### Enable Nginx Caching

Add to Nginx server block:

```nginx
# Browser caching
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Gzip compression
gzip on;
gzip_vary on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

---

## Support

For issues or questions:

- Check Laravel logs: `/var/www/ticketing-system/backend/storage/logs/laravel.log`
- Check Nginx logs: `/var/log/nginx/error.log`
- Review this guide for common issues

---

## Quick Reference Commands

```bash
# Backend
cd /var/www/ticketing-system/backend
php artisan cache:clear
php artisan config:cache
php artisan route:cache
sudo systemctl restart php8.2-fpm

# Frontend
cd /var/www/ticketing-system/frontend
npm run build

# Nginx
sudo nginx -t
sudo systemctl reload nginx

# Logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/www/ticketing-system/backend/storage/logs/laravel.log

# Permissions
sudo chown -R www-data:www-data /var/www/ticketing-system/backend
sudo chmod -R 775 /var/www/ticketing-system/backend/storage
```

---

**Deployment Complete! 🚀**

Your ticketing system should now be live at:

- Frontend: https://example.com
- Backend API: https://api.example.com/api
