// API Response Types
export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User Types
export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  phone: string | null;
  avatar: string | null;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  imageUrl?: string | null; // Alias for backwards compatibility
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
    children?: number;
  };
  parent?: Category | null;
  children?: Category[];
}

// Product Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number | null;
  comparePrice?: number | null;
  sku: string;
  stockQuantity: number;
  stock?: number; // Alias for stockQuantity
  imageUrl?: string | null;
  images: string[];
  sizes: string[];
  colors: string[];
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  _count?: {
    reviews: number;
    orderItems: number;
  };
  averageRating?: number;
}

export interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  tags?: string[];
  search?: string;
  isFeatured?: boolean;
  isActive?: boolean;
}

// Cart Types
export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  size: string | null;
  color: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  product: Product;
}

export interface Cart {
  id: string;
  userId: string;
  couponId: string | null;
  discount: number;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
  coupon?: Coupon | null;
}

// Coupon Types
export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  discountValue: number;
  minPurchaseAmount: number | null;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  perUserLimit: number | null;
  usedCount: number;
  validFrom: string | null;
  validUntil: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponValidation {
  valid: boolean;
  message?: string;
  discount?: number;
  coupon?: Coupon;
}

export interface CouponStats {
  total: number;
  active: number;
  expired: number;
  used: number;
  unused: number;
  totalDiscountGiven: number;
}

// Contact Types
export interface ContactResult {
  id: string;
  subscribed: boolean;
}

// Customer Types (admin)
export type CustomerStatus = 'vip' | 'active' | 'inactive' | 'suspended';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  isActive: boolean;
  joinedAt: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
  status: CustomerStatus;
}

export interface CustomerStats {
  totalCustomers: number;
  activeCount: number;
  avgOrdersPerCustomer: number;
  avgOrderValue: number;
}

export interface CustomerOrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
}

export interface CustomerDetail extends Customer {
  isVerified: boolean;
  addresses: Address[];
  orders: CustomerOrderSummary[];
}

// Address Types
export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Order Types
export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type PaymentMethod =
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'PAYPAL'
  | 'BANK_TRANSFER'
  | 'MOBILE_MONEY'
  | 'CASH_ON_DELIVERY';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string | null;
  quantity: number;
  price: number;
  size: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
  product?: Product;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  tax: number;
  shippingCost: number;
  total: number;
  notes: string | null;
  shippingAddress: any; // JSON
  couponId: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user?: User;
  coupon?: Coupon | null;
}

export interface CreateOrderData {
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  paymentMethod: PaymentMethod;
  notes?: string;
}

// Wishlist Types
export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  product: Product;
}

// Review Types
export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title: string | null;
  comment: string;
  images: string[];
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    name: string | null;
    avatar: string | null;
  };
  product?: Product;
}

export interface ProductReviewStats {
  reviews: Review[];
  stats: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  };
}

export interface CreateReviewData {
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
}

// Dashboard Types (Admin)
export interface DashboardStats {
  users: {
    total: number;
  };
  products: {
    total: number;
    active: number;
    lowStock: number;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
  };
  revenue: {
    total: number;
  };
}

export interface DashboardRecentOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  user: { id: string; email: string; firstName: string | null; lastName: string | null; name: string | null };
  items: { productName: string; quantity: number; price: number }[];
}

export interface DashboardLowStockProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  stockQuantity: number;
  imageUrl: string | null;
  category: { name: string } | null;
}

export interface RevenueByCategory {
  categoryId: string;
  categoryName: string;
  revenue: number;
  itemsSold: number;
}

export interface TopProduct {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice: number | null;
    imageUrl: string | null;
    images: string[];
    stockQuantity: number;
    category: { name: string } | null;
  } | null;
  totalSold: number;
  orderCount: number;
}

export interface CustomerInsights {
  totalCustomers: number;
  newCustomersThisMonth: number;
  topCustomers: Array<{
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    name: string | null;
    _count: { orders: number };
    totalSpent: number;
  }>;
}

export interface SalesAnalytics {
  period: 'week' | 'month' | 'year';
  summary: {
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    totalDiscount: number;
    totalTax: number;
    totalShipping: number;
  };
  chart: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
}

// Inventory Types (admin)
export type InventoryLogType = 'RESTOCK' | 'SALE' | 'RETURN' | 'DAMAGED' | 'ADJUSTMENT';

export interface InventorySummary {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  totalStockQuantity: number;
  totalInventoryValue: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface InventoryValuationItem {
  productId: string;
  productName: string;
  sku: string;
  category: string;
  unitPrice: number;
  quantity: number;
  totalValue: number;
  lastRestockedAt: string | null;
  isActive: boolean;
}

export interface InventoryValuation {
  items: InventoryValuationItem[];
  summary: {
    totalProducts: number;
    totalQuantity: number;
    totalValue: number;
    averageValue: number;
  };
}

export interface RestockRecommendation {
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  averageDailySales: number;
  daysOfStockLeft: number;
  recommendedRestockQuantity: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface InventoryLogEntry {
  id: string;
  productId: string;
  type: InventoryLogType;
  quantity: number;
  reason: string | null;
  createdBy: string | null;
  createdAt: string;
  product?: { id?: string; name: string; sku: string; stockQuantity?: number };
}

export interface InventoryLogsResult {
  logs: InventoryLogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StockAdjustmentInput {
  productId: string;
  quantity: number;
  type: InventoryLogType;
  reason: string;
}

export interface BulkAdjustResult {
  successful: Array<{ productId: string; success: true; result: { product: Product; log: InventoryLogEntry } }>;
  failed: Array<{ productId: string; success: false; error: string }>;
  summary: { total: number; successful: number; failed: number };
}

// Utility Types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type ApiError = {
  message: string;
  error?: string;
  statusCode?: number;
};
