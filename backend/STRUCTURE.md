# Backend API Structure

## Folder Organization

```
backend/src/
├── config/           # Configuration files
│   ├── database.ts   # Prisma client setup
│   └── logger.ts     # Pino logger configuration
│
├── controllers/      # Request handlers
│   └── health.controller.ts
│   # Add more: auth.controller.ts, product.controller.ts, etc.
│
├── middleware/       # Express middleware
│   ├── error.middleware.ts    # Error handling
│   └── logger.middleware.ts   # Request logging
│   # Add more: auth.middleware.ts, validation.middleware.ts
│
├── routes/          # API route definitions
│   ├── index.ts     # Main router
│   └── health.routes.ts
│   # Add more: auth.routes.ts, product.routes.ts, etc.
│
├── services/        # Business logic
│   └── base.service.ts
│   # Add more: auth.service.ts, product.service.ts, etc.
│
├── types/           # TypeScript type definitions
│   └── index.ts
│
├── constants/       # Application constants
│   └── index.ts
│
└── server.ts        # Main application entry point
```

## Next Steps for Development

### 1. Authentication

- Create `auth.controller.ts`, `auth.service.ts`, `auth.routes.ts`
- Implement JWT token generation and validation
- Add `auth.middleware.ts` for protected routes

### 2. Products

- Create `product.controller.ts`, `product.service.ts`, `product.routes.ts`
- Implement CRUD operations
- Add filtering, pagination, and search

### 3. Categories

- Create category management endpoints
- Implement category hierarchy

### 4. Cart & Wishlist

- Cart management endpoints
- Wishlist functionality

### 5. Orders

- Order creation and management
- Order status updates
- Payment integration

### 6. Reviews

- Product review system
- Rating calculations

## Database Setup

1. Update `.env` with your PostgreSQL connection:

   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/clementine_shop"
   ```

2. Run Prisma migrations:

   ```bash
   npm run prisma:migrate
   ```

3. Generate Prisma client:

   ```bash
   npm run prisma:generate
   ```

4. (Optional) Open Prisma Studio to view/edit data:
   ```bash
   npm run prisma:studio
   ```
