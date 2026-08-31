# 🎫 How the Coupon System Works

## Overview

The coupon system provides flexible discount mechanisms for your e-commerce platform with three discount types, usage limits, validity periods, and comprehensive tracking.

---

## 📊 Database Schema

### Coupon Model

```typescript
{
  id: string; // Unique identifier
  code: string; // Coupon code (e.g., "SUMMER2024")
  description: string; // What the coupon is for
  discountType: DiscountType; // PERCENTAGE | FIXED_AMOUNT | FREE_SHIPPING
  discountValue: number; // Percentage or amount value
  minPurchaseAmount: number; // Minimum cart value required
  maxDiscountAmount: number; // Maximum discount cap (for percentage)
  usageLimit: number; // Total uses allowed (null = unlimited)
  perUserLimit: number; // Per user limit (not yet implemented)
  usedCount: number; // Times used so far
  validFrom: Date; // When coupon becomes active
  validUntil: Date; // When coupon expires
  isActive: boolean; // Manual on/off toggle
  createdAt: Date;
  updatedAt: Date;
}
```

### CouponUsage Model (Tracking)

```typescript
{
  id: string;
  couponId: string; // Which coupon was used
  userId: string; // Who used it
  orderId: string; // In which order
  usedAt: Date; // When it was used
}
```

---

## 🎯 Discount Types

### 1. **PERCENTAGE**

Applies a percentage discount to the order total.

**Example:**

- Code: `SAVE20`
- Discount Value: `20` (means 20%)
- Cart Total: $100
- **Discount Applied: $20**
- Final Total: $80

**With Max Cap:**

- Max Discount Amount: `$50`
- Cart Total: $500
- Calculated: 20% × $500 = $100
- **Actual Discount: $50** (capped)
- Final Total: $450

### 2. **FIXED_AMOUNT**

Applies a fixed dollar amount discount.

**Example:**

- Code: `SAVE10`
- Discount Value: `10` (means $10)
- Cart Total: $50
- **Discount Applied: $10**
- Final Total: $40

**Protection:**

- If cart total is $8 and discount is $10
- **Discount Applied: $8** (cannot exceed cart total)
- Final Total: $0

### 3. **FREE_SHIPPING**

Removes shipping cost (handled separately in order calculation).

**Example:**

- Code: `FREESHIP`
- Cart Total: $50
- Shipping: $10
- **Shipping Cost: $0**
- Final Total: $50

---

## ✅ Validation Rules

The coupon system validates the following before applying:

### 1. **Existence Check**

```typescript
if (!coupon) {
  return 'Invalid coupon code';
}
```

### 2. **Active Status**

```typescript
if (!coupon.isActive) {
  return 'Coupon is not active';
}
```

### 3. **Date Validity**

```typescript
const now = new Date();

// Not yet started
if (now < coupon.validFrom) {
  return 'Coupon is not yet valid';
}

// Expired
if (now > coupon.validUntil) {
  return 'Coupon has expired';
}
```

### 4. **Usage Limit**

```typescript
if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
  return 'Coupon usage limit reached';
}
```

### 5. **Minimum Purchase**

```typescript
if (coupon.minPurchaseAmount && orderTotal < coupon.minPurchaseAmount) {
  return 'Minimum purchase of $X required';
}
```

---

## 🔄 Coupon Lifecycle

### 1. **Creation** (Admin)

```http
POST /api/coupons
Authorization: Bearer {adminToken}

{
  "code": "SUMMER2024",
  "description": "Summer Sale - 20% off",
  "discountType": "PERCENTAGE",
  "discountValue": 20,
  "minPurchaseAmount": 50,
  "maxDiscountAmount": 100,
  "usageLimit": 1000,
  "validFrom": "2024-06-01T00:00:00Z",
  "validUntil": "2024-08-31T23:59:59Z",
  "isActive": true
}
```

**Validations:**

- ✅ Code must be unique
- ✅ Percentage cannot exceed 100%
- ✅ Discount value must be > 0
- ✅ Valid from must be before valid until

### 2. **Discovery** (User)

**Get Available Coupons:**

```http
GET /api/coupons/available
```

Returns only coupons that are:

- ✅ Active (`isActive: true`)
- ✅ Within valid date range
- ✅ Not fully used (if usage limit set)

### 3. **Validation** (User/System)

**Check if Coupon Works:**

```http
POST /api/coupons/validate
Authorization: Bearer {userToken}

{
  "code": "SUMMER2024",
  "orderTotal": 100
}
```

**Response:**

```json
{
  "valid": true,
  "discount": 20,
  "message": "Coupon applied successfully",
  "coupon": { ...couponDetails }
}
```

or

```json
{
  "valid": false,
  "message": "Minimum purchase of $50 required"
}
```

### 4. **Application** (During Checkout)

When user places an order with a coupon:

```typescript
// In Order Creation Process:

1. Validate coupon for user and order total
2. Calculate discount amount
3. Create order with coupon applied
4. Record coupon usage
5. Increment coupon used count

// Transaction ensures atomicity
await prisma.$transaction([
  // Create coupon usage record
  prisma.couponUsage.create({
    data: { couponId, userId }
  }),

  // Increment usage counter
  prisma.coupon.update({
    where: { id: couponId },
    data: { usedCount: { increment: 1 } }
  })
])
```

### 5. **Tracking**

Every coupon usage is tracked in `CouponUsage` table:

- Who used it
- When they used it
- In which order
- For analytics and fraud prevention

---

## 💡 Use Cases & Examples

### Example 1: Black Friday Sale

```json
{
  "code": "BLACKFRIDAY50",
  "discountType": "PERCENTAGE",
  "discountValue": 50,
  "minPurchaseAmount": 100,
  "maxDiscountAmount": 200,
  "usageLimit": 5000,
  "validFrom": "2024-11-29T00:00:00Z",
  "validUntil": "2024-11-29T23:59:59Z"
}
```

- 50% off
- Must spend at least $100
- Maximum discount is $200
- Limited to 5000 uses
- Valid only on Black Friday

### Example 2: New Customer Welcome

```json
{
  "code": "WELCOME10",
  "discountType": "FIXED_AMOUNT",
  "discountValue": 10,
  "minPurchaseAmount": 30,
  "usageLimit": null,
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-12-31T23:59:59Z"
}
```

- $10 off
- Minimum purchase $30
- Unlimited uses
- Valid all year

### Example 3: Free Shipping Promo

```json
{
  "code": "SHIPON50",
  "discountType": "FREE_SHIPPING",
  "discountValue": 0,
  "minPurchaseAmount": 50,
  "usageLimit": null,
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-12-31T23:59:59Z"
}
```

- Free shipping
- Minimum purchase $50
- Unlimited uses
- Valid all year

### Example 4: Limited VIP Offer

```json
{
  "code": "VIP100OFF",
  "discountType": "FIXED_AMOUNT",
  "discountValue": 100,
  "minPurchaseAmount": 500,
  "usageLimit": 50,
  "validFrom": "2024-12-01T00:00:00Z",
  "validUntil": "2024-12-25T23:59:59Z"
}
```

- $100 off
- Minimum purchase $500
- Limited to 50 uses (first come, first served)
- Valid during December holiday season

---

## 🛠️ API Endpoints

### Public/User Endpoints

```http
# Get available coupons
GET /api/coupons/available

# Get coupon by code (public)
GET /api/coupons/code/:code

# Validate coupon
POST /api/coupons/validate
Body: { code, orderTotal }

# Get user's usage history
GET /api/coupons/user/usage
```

### Admin Endpoints

```http
# Get all coupons (with filters)
GET /api/coupons?isActive=true&discountType=PERCENTAGE

# Get coupon by ID
GET /api/coupons/:id

# Create coupon
POST /api/coupons
Body: { code, discountType, discountValue, ... }

# Update coupon
PUT /api/coupons/:id
Body: { isActive, validUntil, ... }

# Delete coupon
DELETE /api/coupons/:id

# Get coupon statistics
GET /api/coupons/stats

# Get top performing coupons
GET /api/coupons/top-performing?limit=10

# Deactivate expired coupons (cron job)
POST /api/coupons/deactivate-expired
```

---

## 📈 Analytics & Statistics

The system provides comprehensive analytics:

```typescript
{
  total: 45,              // Total coupons created
  active: 12,             // Currently active
  expired: 18,            // Expired
  used: 30,               // At least 1 use
  unused: 15,             // Never used
  totalDiscountGiven: 5230.50  // Total $ discounted
}
```

**Top Performing Coupons:**

- Sort by most used
- Track revenue impact
- Identify popular campaigns

---

## 🔒 Security & Protection

### 1. **Code Uniqueness**

- Codes are automatically uppercased
- Duplicate codes rejected

### 2. **Deletion Protection**

```typescript
if (coupon.orders.length > 0) {
  throw new Error('Cannot delete used coupon. Deactivate instead.');
}
```

- Cannot delete coupons used in orders
- Preserves order history integrity

### 3. **Usage Tracking**

- Every application recorded
- Fraud detection possible
- Usage patterns analyzed

### 4. **Atomic Operations**

```typescript
// Usage recording and counter increment in single transaction
await prisma.$transaction([...])
```

- Prevents race conditions
- Ensures data consistency

---

## 🚀 Integration Example

### In Cart/Checkout Flow

```typescript
// 1. User enters coupon code
const code = 'SUMMER2024';

// 2. Validate coupon
const validation = await CouponService.validate(code, userId, cartTotal);

if (!validation.valid) {
  // Show error: validation.message
  return;
}

// 3. Apply discount to cart preview
const discount = validation.discount;
const finalTotal = cartTotal - discount;

// Show user:
// Subtotal: $100
// Discount (SUMMER2024): -$20
// Total: $80

// 4. Create order with coupon
const order = await OrderService.create({
  userId,
  items: cartItems,
  couponId: validation.coupon.id,
  discount: discount,
  total: finalTotal,
});

// 5. System automatically:
// - Records coupon usage
// - Increments used count
// - Links coupon to order
```

---

## 🎨 Best Practices

### 1. **Naming Conventions**

- Use clear, memorable codes: `SAVE20`, `WELCOME10`
- Avoid confusing characters: `0/O`, `1/I/l`
- Include context: `SUMMER2024`, `BLACKFRIDAY`

### 2. **Testing Coupons**

Create test coupons with:

- Short validity periods
- Low usage limits
- Obvious codes like `TEST50OFF`

### 3. **Expiration Management**

- Run periodic jobs to deactivate expired coupons
- Send reminders before expiration
- Archive old coupons rather than deleting

### 4. **Stacking Policy**

Currently, the system allows **one coupon per order**. To implement coupon stacking:

- Modify order model to accept multiple coupons
- Validate stacking rules
- Calculate cumulative discounts

### 5. **Per-User Limits**

The schema includes `perUserLimit` field for future implementation:

```typescript
// Check if user exceeded personal limit
const userUsageCount = await prisma.couponUsage.count({
  where: { couponId, userId },
});

if (coupon.perUserLimit && userUsageCount >= coupon.perUserLimit) {
  return 'You have reached the usage limit for this coupon';
}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Coupon usage limit reached" but count looks wrong

**Cause:** Race condition in high-traffic scenarios  
**Solution:** Atomic transactions already implemented

### Issue 2: Users bypassing minimum purchase

**Cause:** Validation not enforced at checkout  
**Solution:** Validate again during order creation

### Issue 3: Expired coupons still showing

**Cause:** Date comparison issues  
**Solution:** Use consistent timezone (UTC) and run deactivation job

### Issue 4: Cannot delete old campaigns

**Cause:** Used in historical orders  
**Solution:** Deactivate instead of delete

---

## 📝 Summary

The coupon system provides:

✅ **3 Discount Types**: Percentage, Fixed Amount, Free Shipping  
✅ **Flexible Rules**: Min purchase, max discount, usage limits  
✅ **Time-Based**: Valid from/until dates  
✅ **Comprehensive Tracking**: Every use recorded  
✅ **Analytics**: Performance metrics and statistics  
✅ **Security**: Atomic operations, deletion protection  
✅ **Admin Control**: Full CRUD operations  
✅ **User-Friendly**: Simple validation and application

The system is production-ready with proper validations, error handling, and data integrity guarantees.
