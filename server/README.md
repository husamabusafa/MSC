# Educational Platform Server

A NestJS server with GraphQL API, Prisma ORM, and SQLite database for the Integrated Educational Platform.

## Tech Stack

- **NestJS** - Node.js framework
- **GraphQL** - API query language
- **Prisma** - Database ORM
- **SQLite** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Jest** - Testing framework

## Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm

## Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
Create a `.env` file in the server root directory:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="24h"
PORT=3001
NODE_ENV=development
GRAPHQL_PLAYGROUND=true
GRAPHQL_INTROSPECTION=true
```

3. Generate Prisma client:
```bash
pnpm prisma:generate
```

4. Run database migrations:
```bash
pnpm prisma:migrate
```

5. Seed the database with initial data:
```bash
pnpm prisma:seed
```

## Running the Server

### Development Mode
```bash
pnpm start:dev
```

### Production Mode
```bash
pnpm build
pnpm start:prod
```

The server will start on `http://localhost:3001`

## GraphQL Playground

Access the GraphQL Playground at `http://localhost:3001/graphql` to test queries and mutations.

## Authentication

The server provides the following authentication endpoints:

### Login
```graphql
mutation {
  login(loginInput: {
    email: "admin@example.com"
    password: "admin123"
  }) {
    accessToken
    user {
      id
      email
      name
      role
      isActive
    }
  }
}
```

### Register
```graphql
mutation {
  register(registerInput: {
    email: "newuser@example.com"
    password: "password123"
    name: "New User"
    universityId: "10001"
  }) {
    accessToken
    user {
      id
      email
      name
      role
      universityId
      isActive
    }
  }
}
```

### Get Current User
```graphql
query {
  me {
    id
    email
    name
    role
    isActive
  }
}
```

## Test Users

After running the seed command, you'll have these test users:

- **Admin**: `admin@example.com` / `admin123`
- **Student**: `student@example.com` / `student123`

## Pre-registered Students

The seed data includes pre-registered students with university IDs:
- `10001` - John Doe
- `10002` - Jane Smith
- `10003` - Bob Johnson

## Testing

### Unit Tests
```bash
pnpm test
```

### E2E Tests
```bash
pnpm test:e2e
```

### Test Coverage
```bash
pnpm test:cov
```

## Database Commands

### View Database
```bash
pnpm prisma:studio
```

### Reset Database
```bash
pnpm prisma:reset
```

### Generate Prisma Client
```bash
pnpm prisma:generate
```

## Project Structure

```
src/
├── auth/           # Authentication module
│   ├── dto/        # Data transfer objects
│   ├── guards/     # Authentication guards
│   ├── strategies/ # Passport strategies
│   └── decorators/ # Custom decorators
├── users/          # Users module
├── prisma/         # Prisma service
└── main.ts         # Application entry point

prisma/
├── schema.prisma   # Database schema
└── seed.ts         # Database seeding

test/
└── auth.e2e-spec.ts # E2E tests
```

## Development

### Adding New Features

1. Create a new module: `nest generate module <module-name>`
2. Add service: `nest generate service <service-name>`
3. Add resolver: `nest generate resolver <resolver-name>`
4. Update Prisma schema if needed
5. Run migrations: `pnpm prisma:migrate`
6. Add tests

### Environment Variables

The server uses the following environment variables:

- `DATABASE_URL` - SQLite database connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_IN` - JWT token expiration time
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `GRAPHQL_PLAYGROUND` - Enable GraphQL Playground
- `GRAPHQL_INTROSPECTION` - Enable GraphQL introspection

## API Documentation

The GraphQL schema is automatically generated and can be explored using the GraphQL Playground at `/graphql` endpoint.

## Security

- Passwords are hashed using bcryptjs
- JWT tokens are used for authentication
- Input validation using class-validator
- CORS is enabled for the frontend
- Role-based access control

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run tests: `pnpm test`
6. Submit a pull request 