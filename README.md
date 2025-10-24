# Customer Support Ticketing System

A production-ready full-stack **Customer Support Ticketing System** built with **Laravel** (backend) and **React** (frontend), featuring real-time chat, role-based access control, and comprehensive ticket management.

## 🚀 Features

### Backend (Laravel)

- ✅ **Authentication** with Laravel Sanctum (token-based)
- ✅ **Role-Based Access Control** (Admin & Customer roles)
- ✅ **Tickets Module** with CRUD operations
- ✅ **File Upload** support for ticket attachments
- ✅ **Comments System** for ticket discussions
- ✅ **Real-Time Chat** using Pusher
- ✅ **RESTful API** with proper validation
- ✅ **Database Relationships** with Eloquent ORM
- ✅ **Secure** with CORS, CSRF protection, and bcrypt hashing

### Frontend (React)

- ✅ **Modern UI** with responsive design
- ✅ **React Router** for navigation
- ✅ **React Query** for data fetching and caching
- ✅ **Form Validation** with React Hook Form & Yup
- ✅ **Real-Time Updates** with Pusher
- ✅ **Toast Notifications** for user feedback
- ✅ **Protected Routes** based on authentication and roles
- ✅ **File Upload** with preview
- ✅ **Dashboard** with different views for Admin & Customer

---

## 📋 Prerequisites

- PHP >= 8.2
- Composer
- Node.js >= 16.x
- MySQL
- npm or yarn

---

## 🛠️ Backend Setup (Laravel)

### 1. Clone and Install

```bash
cd ticketing-system-backend
composer install
```

### 2. Environment Configuration

```bash
cp .env.example .env
php artisan key:generate
```

### 3. Database Configuration

Update your `.env` file:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ticketing_system
DB_USERNAME=root
DB_PASSWORD=your_password
```

### 4. Pusher Configuration

Sign up at [pusher.com](https://pusher.com) and get your credentials, then update `.env`:

```env
BROADCAST_CONNECTION=pusher

PUSHER_APP_ID=your_app_id
PUSHER_APP_KEY=your_app_key
PUSHER_APP_SECRET=your_app_secret
PUSHER_APP_CLUSTER=mt1
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
```

### 5. Frontend URL Configuration

```env
FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:5173,127.0.0.1,127.0.0.1:8000,::1
```

### 6. Run Migrations and Seeders

```bash
php artisan migrate
php artisan db:seed --class=AdminSeeder
php artisan storage:link
```

### 7. Start the Server

```bash
php artisan serve
```

Backend will run at: `http://localhost:8000`

---

## 🎨 Frontend Setup (React)

### 1. Install Dependencies

```bash
cd ticketing-system-frontend
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Update `.env`:

```env
VITE_API_URL=http://localhost:8000/api
VITE_PUSHER_APP_KEY=your_app_key
VITE_PUSHER_APP_CLUSTER=mt1
```

### 3. Start Development Server

```bash
npm run dev
```

Frontend will run at: `http://localhost:5173`

---

## 👥 Default Accounts

After running the seeder, you can login with:

**Admin Account:**

- Email: `admin@ticketing.com`
- Password: `password123`

**Customer Account:**

- Email: `customer@example.com`
- Password: `password123`

---

## 📡 API Endpoints

### Authentication

```
POST   /api/register         - Register new customer
POST   /api/login           - Login user
POST   /api/logout          - Logout user
GET    /api/me              - Get authenticated user
```

### Tickets

```
GET    /api/tickets         - List tickets (filtered by role)
POST   /api/tickets         - Create ticket (Customer only)
GET    /api/tickets/{id}    - Get ticket details
PUT    /api/tickets/{id}    - Update ticket
DELETE /api/tickets/{id}    - Delete ticket
```

### Comments

```
GET    /api/tickets/{id}/comments  - Get ticket comments
POST   /api/tickets/{id}/comments  - Add comment
```

### Chat

```
GET    /api/tickets/{id}/chats     - Get chat messages
POST   /api/tickets/{id}/chats     - Send chat message
```

---

## 🗂️ Project Structure

### Backend (Laravel)

```
ticketing-system-backend/
├── app/
│   ├── Events/
│   │   └── MessageSent.php
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       ├── AuthController.php
│   │   │       ├── TicketController.php
│   │   │       ├── CommentController.php
│   │   │       └── ChatController.php
│   │   ├── Middleware/
│   │   │   └── RoleMiddleware.php
│   │   └── Requests/
│   │       ├── StoreTicketRequest.php
│   │       ├── UpdateTicketRequest.php
│   │       └── StoreCommentRequest.php
│   └── Models/
│       ├── User.php
│       ├── Ticket.php
│       ├── Comment.php
│       └── Chat.php
├── database/
│   ├── migrations/
│   └── seeders/
│       └── AdminSeeder.php
└── routes/
    ├── api.php
    └── channels.php
```

### Frontend (React)

```
ticketing-system-frontend/
├── src/
│   ├── api/
│   │   ├── axios.js
│   │   └── services.js
│   ├── components/
│   │   ├── ProtectedRoute.jsx
│   │   ├── Layout.jsx
│   │   └── ...
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── TicketList.jsx
│   │   ├── TicketDetail.jsx
│   │   ├── TicketForm.jsx
│   │   └── Chat.jsx
│   ├── App.jsx
│   └── main.jsx
└── package.json
```

---

## 🔒 Security Features

- **Authentication**: Token-based with Laravel Sanctum
- **Password Hashing**: bcrypt algorithm
- **CORS**: Configured for frontend domain
- **CSRF Protection**: Enabled for state-changing operations
- **Input Validation**: Laravel Form Requests
- **Authorization**: Middleware-based role checking
- **SQL Injection Prevention**: Eloquent ORM parameterized queries
- **XSS Protection**: React's automatic escaping

---

## 🧪 Testing

### Backend Tests

```bash
cd ticketing-system-backend
php artisan test
```

### Frontend Tests

```bash
cd ticketing-system-frontend
npm run test
```

---

## 🚀 Deployment

### Backend Deployment (VPS/Render/Railway)

#### Option 1: VPS (Ubuntu + Nginx)

1. **Setup Server**

```bash
sudo apt update
sudo apt install php8.2 php8.2-fpm php8.2-mysql php8.2-mbstring php8.2-xml php8.2-curl nginx mysql-server composer
```

2. **Clone and Setup**

```bash
git clone your-repo.git /var/www/ticketing-backend
cd /var/www/ticketing-backend
composer install --no-dev --optimize-autoloader
cp .env.example .env
php artisan key:generate
```

3. **Configure Nginx**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/ticketing-backend/public;

    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

4. **Set Permissions**

```bash
sudo chown -R www-data:www-data /var/www/ticketing-backend
sudo chmod -R 775 /var/www/ticketing-backend/storage
sudo chmod -R 775 /var/www/ticketing-backend/bootstrap/cache
```

5. **Run Migrations**

```bash
php artisan migrate --force
php artisan db:seed --class=AdminSeeder --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

#### Option 2: Render.com

1. Create new Web Service
2. Connect your GitHub repo
3. Set build command: `composer install && php artisan migrate --force`
4. Set start command: `php artisan serve --host=0.0.0.0 --port=$PORT`
5. Add environment variables from `.env`

#### Option 3: Railway.app

1. Create new project
2. Deploy from GitHub
3. Add MySQL database
4. Set environment variables
5. Railway auto-deploys on push

### Frontend Deployment (Vercel/Netlify)

#### Option 1: Vercel

```bash
npm install -g vercel
vercel
```

#### Option 2: Netlify

```bash
npm run build
# Upload dist/ folder to Netlify
```

Or connect GitHub repo for auto-deployment.

### Environment Variables for Production

**Backend:**

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-backend-domain.com

DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_DATABASE=your-db-name
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password

FRONTEND_URL=https://your-frontend-domain.com
```

**Frontend:**

```env
VITE_API_URL=https://your-backend-domain.com/api
```

---

## 📝 Git Workflow

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit: Customer Support Ticketing System"

# Add remote
git remote add origin your-repo-url
git branch -M main
git push -u origin main
```

---

## 🐛 Troubleshooting

### CORS Issues

- Ensure `FRONTEND_URL` is set in backend `.env`
- Check `config/cors.php` configuration
- Verify `SANCTUM_STATEFUL_DOMAINS` includes frontend domain

### Database Connection

- Check MySQL service is running
- Verify database credentials in `.env`
- Ensure database exists: `CREATE DATABASE ticketing_system;`

### File Upload Issues

- Run `php artisan storage:link`
- Check `storage/app/public` permissions
- Verify `FILESYSTEM_DISK` in `.env`

### Real-Time Chat Not Working

- Verify Pusher credentials
- Check browser console for WebSocket errors
- Ensure channels.php is configured

---

## 📚 Additional Resources

- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://react.dev)
- [Laravel Sanctum](https://laravel.com/docs/sanctum)
- [Pusher Documentation](https://pusher.com/docs)
- [Vite Documentation](https://vitejs.dev)

---

## 👨‍💻 Author

Built with ❤️ using Laravel & React

---

## 📄 License

This project is open-source and available under the MIT License.
