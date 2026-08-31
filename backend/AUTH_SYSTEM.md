# JWT Authentication System Documentation

## Overview

This is a complete JWT-based authentication system with access and refresh tokens, token rotation, password hashing using bcrypt, and role-based access control.

## Features

✅ **Secure Password Hashing** - bcrypt with 12 salt rounds
✅ **JWT Access Tokens** - Short-lived tokens (15 minutes default)
✅ **Refresh Tokens** - Long-lived tokens (7 days default) stored in database
✅ **Token Rotation** - Old refresh tokens are revoked when refreshing
✅ **Token Blacklisting** - Revoked tokens stored in database
✅ **Role-Based Access Control** - CUSTOMER, ADMIN, SUPER_ADMIN roles
✅ **Protected Routes** - Middleware for authentication and authorization
✅ **Profile Management** - Update profile and change password
✅ **Multi-Device Logout** - Revoke all tokens at once

## Tech Stack

- **Express.js** - Web framework
- **Prisma** - ORM for PostgreSQL
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT token generation and verification
- **TypeScript** - Type safety

## Database Schema

### User Model

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  firstName     String?
  lastName      String?
  phone         String?
  avatar        String?
  role          UserRole  @default(CUSTOMER)
  isVerified    Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  refreshTokens RefreshToken[]
}
```

### RefreshToken Model

```prisma
model RefreshToken {
  id          String   @id @default(cuid())
  token       String   @unique
  userId      String
  expiresAt   DateTime
  isRevoked   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## API Endpoints

### Public Endpoints (No Authentication Required)

#### 1. Register User

**POST** `/api/auth/register`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+250788123456",
  "role": "CUSTOMER"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "clx1234567890",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+250788123456",
      "role": "CUSTOMER",
      "isVerified": false,
      "createdAt": "2024-12-07T10:30:00.000Z",
      "updatedAt": "2024-12-07T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Validation Rules:**

- Email is required and must be valid format
- Password is required and must be at least 8 characters
- Role defaults to CUSTOMER if not provided

---

#### 2. Login User

**POST** `/api/auth/login`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "clx1234567890",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "CUSTOMER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### 3. Refresh Token

**POST** `/api/auth/refresh`

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Tokens refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Note:** The old refresh token is automatically revoked (token rotation).

---

#### 4. Logout User

**POST** `/api/auth/logout`

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### Protected Endpoints (Authentication Required)

**Authorization Header Required:**

```
Authorization: Bearer <accessToken>
```

#### 5. Get Current User Profile

**GET** `/api/auth/me`

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx1234567890",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+250788123456",
      "avatar": null,
      "role": "CUSTOMER",
      "isVerified": false,
      "createdAt": "2024-12-07T10:30:00.000Z",
      "updatedAt": "2024-12-07T10:30:00.000Z"
    }
  }
}
```

---

#### 6. Update Profile

**PATCH** `/api/auth/profile`

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+250788999888",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "clx1234567890",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Smith",
      "phone": "+250788999888",
      "avatar": "https://example.com/avatar.jpg",
      "role": "CUSTOMER"
    }
  }
}
```

---

#### 7. Change Password

**POST** `/api/auth/change-password`

**Request Body:**

```json
{
  "oldPassword": "SecurePass123",
  "newPassword": "NewSecurePass456"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password changed successfully. Please login again."
}
```

**Note:** All refresh tokens are revoked after password change (forces re-login on all devices).

---

#### 8. Logout from All Devices

**POST** `/api/auth/logout-all`

**Response:**

```json
{
  "success": true,
  "message": "Logged out from all devices successfully"
}
```

**Note:** Revokes all refresh tokens for the user.

---

#### 9. Verify Token (Testing)

**GET** `/api/auth/verify`

**Response:**

```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "user": {
      "userId": "clx1234567890",
      "email": "user@example.com",
      "role": "CUSTOMER"
    }
  }
}
```

---

## Middleware

### 1. authenticateToken

Verifies JWT access token from Authorization header.

**Usage:**

```typescript
import { authenticateToken } from '../middleware/auth.middleware';

router.get('/protected', authenticateToken, controller);
```

### 2. requireRole

Checks if user has required role(s).

**Usage:**

```typescript
import { requireRole } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

// Single role
router.post('/admin-only', authenticateToken, requireRole(UserRole.ADMIN), controller);

// Multiple roles
router.post(
  '/admin-or-super',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  controller,
);
```

### 3. requireAdmin

Shorthand for admin and super admin roles.

**Usage:**

```typescript
import { requireAdmin } from '../middleware/auth.middleware';

router.delete('/users/:id', authenticateToken, requireAdmin, controller);
```

### 4. requireSuperAdmin

Restricts access to super admins only.

**Usage:**

```typescript
import { requireSuperAdmin } from '../middleware/auth.middleware';

router.post('/system-settings', authenticateToken, requireSuperAdmin, controller);
```

### 5. optionalAuth

Attaches user if token is valid, but doesn't fail if not authenticated.

**Usage:**

```typescript
import { optionalAuth } from '../middleware/auth.middleware';

router.get('/products', optionalAuth, controller);
// Can check if (req.user) to provide personalized data
```

---

## Security Features

### Password Hashing

- **Algorithm:** bcrypt
- **Salt Rounds:** 12
- **Password Requirements:** Minimum 8 characters

### Token Configuration

- **Access Token:**
  - Expiry: 15 minutes (configurable via `JWT_EXPIRES_IN`)
  - Secret: `JWT_SECRET` environment variable
  - Payload: userId, email, role

- **Refresh Token:**
  - Expiry: 7 days (configurable via `REFRESH_TOKEN_EXPIRES_IN`)
  - Secret: `REFRESH_TOKEN_SECRET` environment variable
  - Stored in database with expiry date
  - Can be revoked

### Token Rotation

When refreshing tokens:

1. Old refresh token is verified
2. Old refresh token is revoked in database
3. New access token is generated
4. New refresh token is generated and stored

### Token Blacklisting Strategy

- Refresh tokens are stored in database
- Each token has `isRevoked` flag
- Expired and revoked tokens can be cleaned up periodically

---

## Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-token-secret-change-in-production
REFRESH_TOKEN_EXPIRES_IN=7d

# Database
DATABASE_URL=postgresql://user:password@host:5432/database
```

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Email and password are required"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Invalid or expired access token"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "User not found"
}
```

### 409 Conflict

```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Failed to register user"
}
```

---

## Testing with cURL

### Register a new user

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

### Get Profile (Protected)

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Refresh Token

```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### Logout

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

## Database Migration

Run the migration to create the RefreshToken table:

```bash
cd backend
npx prisma migrate dev --name add_refresh_token
# or
npx prisma db push
```

Generate Prisma client:

```bash
npx prisma generate
```

---

## Checklist

✅ Register endpoint - `/api/auth/register`
✅ Login endpoint - `/api/auth/login`
✅ Refresh token endpoint - `/api/auth/refresh`
✅ Logout endpoint - `/api/auth/logout`
✅ Token rotation logic - Implemented in `AuthService.rotateRefreshToken()`
✅ Password hashing (bcrypt) - 12 salt rounds
✅ Role-based middleware - `requireRole()`, `requireAdmin`, `requireSuperAdmin`
✅ Token blacklisting strategy - Database-stored with `isRevoked` flag
✅ Prisma integration - Complete with User and RefreshToken models

---

## Additional Features

- **Profile Management** - Update profile and avatar
- **Change Password** - With old password verification
- **Multi-Device Logout** - Revoke all tokens at once
- **Token Verification** - Test endpoint for token validation
- **Optional Authentication** - Middleware for public-but-personalized routes
- **Automatic Token Cleanup** - Method to clean expired/revoked tokens

---

## Production Recommendations

1. **Environment Variables:**
   - Use strong, random secrets for JWT_SECRET and REFRESH_TOKEN_SECRET
   - Keep secrets in environment variables, never commit to code

2. **Token Expiry:**
   - Access tokens: 15-30 minutes
   - Refresh tokens: 7-30 days
   - Adjust based on security requirements

3. **Rate Limiting:**
   - Already implemented globally
   - Consider stricter limits for auth endpoints

4. **HTTPS:**
   - Always use HTTPS in production
   - Tokens should never be sent over HTTP

5. **Token Storage (Client-side):**
   - Store access token in memory or secure cookie
   - Store refresh token in httpOnly cookie
   - Never store in localStorage (XSS vulnerability)

6. **Cleanup Job:**
   - Set up a cron job to run `AuthService.cleanupExpiredTokens()` daily
   - Keeps database clean and performant

7. **Monitoring:**
   - Log failed login attempts
   - Monitor for suspicious token refresh patterns
   - Track token revocations

---

## File Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── auth.controller.ts      # Auth endpoint handlers
│   ├── middleware/
│   │   └── auth.middleware.ts      # JWT verification & role checking
│   ├── services/
│   │   └── auth.service.ts         # Auth business logic
│   └── routes/
│       ├── auth.routes.ts          # Auth route definitions
│       └── index.ts                # Main router
└── prisma/
    └── schema.prisma               # Database schema with User & RefreshToken
```

---

## Next Steps

1. ✅ Test all endpoints with the database connection restored
2. Set up email verification for new users
3. Implement password reset functionality
4. Add OAuth integration (Google, Facebook, etc.)
5. Set up automated token cleanup cron job
6. Implement 2FA (Two-Factor Authentication)
7. Add audit logging for security events
8. Create admin endpoints for user management

---

## Support

For issues or questions, please refer to:

- JWT Documentation: https://jwt.io/introduction
- Prisma Documentation: https://www.prisma.io/docs
- bcrypt Documentation: https://github.com/kelektiv/node.bcrypt.js
