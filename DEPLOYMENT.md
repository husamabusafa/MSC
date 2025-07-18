# Deployment Guide

## Environment Variables Setup

### Client Environment Variables (client/.env)

```env
# Development
VITE_GRAPHQL_URL=http://localhost:3900/graphql

# Production
VITE_GRAPHQL_URL=https://your-api-domain.com/graphql
```

### Server Environment Variables (server/.env)

```env
# Database Configuration
DATABASE_URL="file:./dev.db"

# Authentication (IMPORTANT: Change in production!)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRATION="24h"

# Server Configuration
PORT=3900
NODE_ENV="development"

# CORS Configuration
FRONTEND_URL="http://localhost:5900,http://localhost:5901"

# Production Example:
# DATABASE_URL="postgresql://user:password@localhost:5432/database"
# JWT_SECRET="your-production-jwt-secret-at-least-32-characters"
# PORT=3000
# NODE_ENV="production"
# FRONTEND_URL="https://yourdomain.com"
```

## Development Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up database:**
   ```bash
   cd server
   pnpm run prisma:generate
   pnpm run prisma:migrate
   ```

3. **Run applications:**
   ```bash
   # Terminal 1: Start server
   cd server
   pnpm run start:dev

   # Terminal 2: Start client
   cd client
   pnpm run dev
   ```

## Production Deployment

### 1. Environment Variables

**Server (.env):**
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_SECRET="your-production-jwt-secret-at-least-32-characters"
PORT=3000
NODE_ENV="production"
FRONTEND_URL="https://yourdomain.com"
```

**Client (.env):**
```env
VITE_GRAPHQL_URL=https://your-api-domain.com/graphql
```

### 2. Database Setup

For production, use PostgreSQL:
```bash
# Install PostgreSQL
# Create database
# Update DATABASE_URL in .env

# Run migrations
pnpm run prisma:migrate
```

### 3. Build Applications

```bash
# Build client
cd client
pnpm run build

# Build server
cd server
pnpm run build
```

### 4. Start Production Server

```bash
cd server
pnpm run start:prod
```

## Security Considerations

1. **JWT Secret**: Use a strong, random secret key (at least 32 characters)
2. **Database**: Use PostgreSQL in production, not SQLite
3. **HTTPS**: Always use HTTPS in production
4. **CORS**: Restrict CORS origins to your actual domain
5. **Environment**: Never commit .env files to version control

## Default Admin Account

- Email: admin.msc@gmail.com
- Password: password123
- Role: SUPER_ADMIN

**Important**: Change the default admin password after first login!

## Ports

- **Development**: 
  - Client: 5900/5901
  - Server: 3900
- **Production**: 
  - Client: Served via web server (nginx/apache)
  - Server: 3000 (or as configured)

## Troubleshooting

1. **Database connection issues**: Check DATABASE_URL format
2. **CORS errors**: Verify FRONTEND_URL matches your client domain
3. **JWT errors**: Ensure JWT_SECRET is set and consistent
4. **Port conflicts**: Check if ports are available or change in .env 