import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';
import productRoutes from './product.routes';
import couponRoutes from './coupon.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';
import inventoryRoutes from './inventory.routes';
import addressRoutes from './address.routes';
import wishlistRoutes from './wishlist.routes';
import reviewRoutes from './review.routes';
import userRoutes from './user.routes';
import customerRoutes from './customer.routes';
import dashboardRoutes from './dashboard.routes';
import contactRoutes from './contact.routes';
import paymentRoutes from './payment.routes';
import webhookRoutes from './webhook.routes';

const router = Router();

// API Routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/coupons', couponRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/addresses', addressRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/reviews', reviewRoutes);
router.use('/users', userRoutes);
router.use('/customers', customerRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/contact', contactRoutes);
router.use('/payments', paymentRoutes);
router.use('/webhooks', webhookRoutes);

export default router;
