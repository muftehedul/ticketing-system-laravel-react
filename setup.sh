#!/bin/bash

# Customer Support Ticketing System - Setup Script
# This script helps you set up both backend and frontend quickly

echo "=================================="
echo "Ticketing System Setup"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -d "ticketing-system-backend" ] || [ ! -d "ticketing-system-frontend" ]; then
    echo "Error: Please run this script from the project root directory"
    echo "Current directory: $(pwd)"
    exit 1
fi

echo "🚀 Setting up Laravel Backend..."
echo ""

# Backend setup
cd ticketing-system-backend

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
else
    echo "⚠️  .env file already exists, skipping..."
fi

# Install composer dependencies
echo "Installing Composer dependencies..."
composer install

# Generate application key
echo "Generating application key..."
php artisan key:generate

# Ask for database configuration
echo ""
echo "📊 Database Configuration"
read -p "Database name (default: ticketing_system): " db_name
db_name=${db_name:-ticketing_system}

read -p "Database username (default: root): " db_user
db_user=${db_user:-root}

read -sp "Database password (press Enter for empty): " db_pass
echo ""

# Update .env with database credentials
sed -i "s/DB_DATABASE=.*/DB_DATABASE=$db_name/" .env
sed -i "s/DB_USERNAME=.*/DB_USERNAME=$db_user/" .env
sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$db_pass/" .env

# Ask for Pusher configuration
echo ""
echo "📡 Pusher Configuration (get from pusher.com)"
read -p "Pusher App ID: " pusher_id
read -p "Pusher App Key: " pusher_key
read -p "Pusher App Secret: " pusher_secret
read -p "Pusher Cluster (default: mt1): " pusher_cluster
pusher_cluster=${pusher_cluster:-mt1}

# Update .env with Pusher credentials
sed -i "s/PUSHER_APP_ID=.*/PUSHER_APP_ID=$pusher_id/" .env
sed -i "s/PUSHER_APP_KEY=.*/PUSHER_APP_KEY=$pusher_key/" .env
sed -i "s/PUSHER_APP_SECRET=.*/PUSHER_APP_SECRET=$pusher_secret/" .env
sed -i "s/PUSHER_APP_CLUSTER=.*/PUSHER_APP_CLUSTER=$pusher_cluster/" .env

# Run migrations
echo ""
echo "Running database migrations..."
php artisan migrate

# Run seeders
echo "Running database seeders..."
php artisan db:seed --class=AdminSeeder

# Create storage link
echo "Creating storage link..."
php artisan storage:link

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "=================================="
echo ""

# Frontend setup
cd ../ticketing-system-frontend

echo "🎨 Setting up React Frontend..."
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    
    # Update with Pusher key
    sed -i "s/VITE_PUSHER_APP_KEY=.*/VITE_PUSHER_APP_KEY=$pusher_key/" .env
    sed -i "s/VITE_PUSHER_APP_CLUSTER=.*/VITE_PUSHER_APP_CLUSTER=$pusher_cluster/" .env
    
    echo "✅ .env file created and configured"
else
    echo "⚠️  .env file already exists, skipping..."
fi

# Install npm dependencies
echo "Installing NPM dependencies..."
npm install

echo ""
echo "✅ Frontend setup complete!"
echo ""

# Print summary
cd ..
echo "=================================="
echo "🎉 Setup Complete!"
echo "=================================="
echo ""
echo "📋 Default Accounts:"
echo "   Admin: admin@ticketing.com / password123"
echo "   Customer: customer@example.com / password123"
echo ""
echo "🚀 To start the application:"
echo ""
echo "   Backend (Laravel):"
echo "   $ cd ticketing-system-backend"
echo "   $ php artisan serve"
echo "   (http://localhost:8000)"
echo ""
echo "   Frontend (React):"
echo "   $ cd ticketing-system-frontend"
echo "   $ npm run dev"
echo "   (http://localhost:5173)"
echo ""
echo "=================================="
