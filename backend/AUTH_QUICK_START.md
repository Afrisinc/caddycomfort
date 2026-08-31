# 🔐 JWT Authentication System - Quick Start Guide

## ✅ Implementation Complete

All authentication features have been successfully implemented:

- ✅ **Register endpoint** (`POST /api/auth/register`)
- ✅ **Login endpoint** (`POST /api/auth/login`)
- ✅ **Refresh token endpoint** (`POST /api/auth/refresh`)
- ✅ **Logout endpoint** (`POST /api/auth/logout`)
- ✅ **Token rotation logic** (automatic on refresh)
- ✅ **Password hashing** (bcrypt with 12 salt rounds)
- ✅ **Role-based middleware** (CUSTOMER, ADMIN, SUPER_ADMIN)
- ✅ **Prisma integration** (User & RefreshToken models)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Database

Make sure your `.env` file has the correct `DATABASE_URL`:

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-token-secret-change-in-production
REFRESH_TOKEN_EXPIRES_IN=7d
```

### 3. Run Migration

```bash
npx prisma migrate dev --name add_refresh_token
# or
npx prisma db push
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Start Server

```bash
npm run dev
```

## 📝 Quick Test

### Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

Save the `accessToken` and `refreshToken` from the response.

### Access Protected Route

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📚 Documentation

- **Full API Documentation**: `AUTH_SYSTEM.md`
- **Postman Collection**: `Clementine_Auth_API.postman_collection.json`
- **Test Script**: `test-auth.ts`

## 🔑 Key Features

### Security

- **bcrypt** password hashing (12 rounds)
- **JWT** tokens with expiration
- **Token rotation** on refresh
- **Token blacklisting** via database
- **Role-based access control**

### Token Strategy

- **Access Token**: 15 minutes (short-lived, stateless)
- **Refresh Token**: 7 days (long-lived, stored in DB)
- **Rotation**: Old refresh token revoked when refreshing
- **Revocation**: All tokens revoked on password change

### Available Roles

- `CUSTOMER` - Default role for regular users
- `ADMIN` - Admin users with elevated permissions
- `SUPER_ADMIN` - Super admins with full access

## 🛠️ Middleware Usage

### Require Authentication

```typescript
import { authenticateToken } from '../middleware/auth.middleware';

router.get('/protected', authenticateToken, controller);
```

### Require Specific Role

```typescript
import { requireRole } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

router.post('/admin', authenticateToken, requireRole(UserRole.ADMIN), controller);
```

### Require Admin (ADMIN or SUPER_ADMIN)

```typescript
import { requireAdmin } from '../middleware/auth.middleware';

router.delete('/users/:id', authenticateToken, requireAdmin, controller);
```

### Optional Authentication

```typescript
import { optionalAuth } from '../middleware/auth.middleware';

// Attaches user if authenticated, but doesn't fail if not
router.get('/products', optionalAuth, controller);
```

## 📦 Files Created

```
backend/
├── src/
│   ├── controllers/
│   │   └── auth.controller.ts          # Auth endpoints
│   ├── middleware/
│   │   └── auth.middleware.ts          # JWT & role middleware
│   ├── services/
│   │   └── auth.service.ts             # Auth business logic
│   └── routes/
│       └── auth.routes.ts              # Auth routes
├── prisma/
│   └── schema.prisma                   # Updated with RefreshToken
├── AUTH_SYSTEM.md                      # Full documentation
├── AUTH_QUICK_START.md                 # This file
├── test-auth.ts                        # Test script
└── Clementine_Auth_API.postman_collection.json
```

## 🧪 Testing

### Using Postman

1. Import `Clementine_Auth_API.postman_collection.json`
2. Set `baseUrl` variable to `http://localhost:5000`
3. Run requests in order (Register → Login → Get Profile, etc.)
4. Access and refresh tokens are automatically stored

### Using Test Script

```bash
# Install axios if not already installed
npm install axios

# Run the test script
npx ts-node test-auth.ts
```

### Using cURL

See examples in `AUTH_SYSTEM.md`

## 🔄 Token Flow

1. **Register/Login** → Receive access + refresh tokens
2. **Access Protected Routes** → Use access token in Authorization header
3. **Token Expires** → Use refresh token to get new tokens
4. **Logout** → Revoke refresh token
5. **Change Password** → All tokens revoked, must login again

## ⚠️ Important Notes

### Production Checklist

- [ ] Change `JWT_SECRET` and `REFRESH_TOKEN_SECRET` to strong random strings
- [ ] Use HTTPS only
- [ ] Store refresh tokens in httpOnly cookies (not localStorage)
- [ ] Set up CORS properly
- [ ] Enable rate limiting on auth endpoints
- [ ] Set up automated cleanup for expired tokens
- [ ] Add logging for security events

### Token Storage (Client-side)

- **Access Token**: Memory or sessionStorage (short-lived)
- **Refresh Token**: httpOnly cookie (more secure)
- **Never**: localStorage (vulnerable to XSS)

## 🐛 Troubleshooting

### Database Connection Error

```
Error: Can't reach database server
```

**Solution**: Check your `DATABASE_URL` in `.env` and ensure database is running

### Token Verification Failed

```
Invalid or expired access token
```

**Solution**: Use refresh token endpoint to get new access token

### User Already Exists

```
User with this email already exists
```

**Solution**: Use login endpoint instead, or use different email

## 📖 Next Steps

1. ✅ Test all endpoints with restored database connection
2. Implement email verification
3. Add password reset functionality
4. Set up OAuth (Google, Facebook)
5. Create admin user management endpoints
6. Add 2FA (Two-Factor Authentication)
7. Set up automated token cleanup cron job

## 🤝 Support

For detailed API documentation, see `AUTH_SYSTEM.md`
For issues, check the error messages - they're descriptive!

---

**Status**: ✅ Ready for testing (pending database connection)
**Last Updated**: December 7, 2024
