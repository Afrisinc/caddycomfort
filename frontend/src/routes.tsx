import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from '@/App';
import ErrorPage from '@/pages/ErrorPage';

const HomePage = lazy(() => import('@/pages/HomePage'));
const ShopPage = lazy(() => import('@/pages/ShopPage'));
const ShopProductPage = lazy(() => import('@/pages/ShopProductPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('@/pages/VerifyEmailPage'));
const AboutPage = lazy(() => import('@/pages/about/AboutPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const FaqPage = lazy(() => import('@/pages/FaqPage'));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));
const ShippingPage = lazy(() => import('@/pages/ShippingPage'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));
const ShowcasePage = lazy(() => import('@/pages/ShowcasePage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const AccountPage = lazy(() => import('@/pages/account/AccountPage'));
const AccountProfilePage = lazy(() => import('@/pages/account/AccountProfilePage'));
const AccountAddressesPage = lazy(() => import('@/pages/account/AccountAddressesPage'));
const AccountOrdersPage = lazy(() => import('@/pages/account/AccountOrdersPage'));
const AccountOrderDetailPage = lazy(() => import('@/pages/account/AccountOrderDetailPage'));
const AccountWishlistPage = lazy(() => import('@/pages/account/AccountWishlistPage'));

const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminAnalyticsPage = lazy(() => import('@/pages/admin/AdminAnalyticsPage'));
const AdminCategoriesPage = lazy(() => import('@/pages/admin/AdminCategoriesPage'));
const AdminCategoryNewPage = lazy(() => import('@/pages/admin/AdminCategoryNewPage'));
const AdminCategoryEditPage = lazy(() => import('@/pages/admin/AdminCategoryEditPage'));
const AdminCouponsPage = lazy(() => import('@/pages/admin/AdminCouponsPage'));
const AdminCouponNewPage = lazy(() => import('@/pages/admin/AdminCouponNewPage'));
const AdminCouponEditPage = lazy(() => import('@/pages/admin/AdminCouponEditPage'));
const AdminCustomersPage = lazy(() => import('@/pages/admin/AdminCustomersPage'));
const AdminCustomerDetailPage = lazy(() => import('@/pages/admin/AdminCustomerDetailPage'));
const AdminInventoryPage = lazy(() => import('@/pages/admin/AdminInventoryPage'));
const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminOrdersPage'));
const AdminProductsPage = lazy(() => import('@/pages/admin/AdminProductsPage'));
const AdminProductNewPage = lazy(() => import('@/pages/admin/AdminProductNewPage'));
const AdminProductDetailPage = lazy(() => import('@/pages/admin/AdminProductDetailPage'));
const AdminProductEditPage = lazy(() => import('@/pages/admin/AdminProductEditPage'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'shop', element: <ShopPage /> },
      { path: 'shop/:id', element: <ShopProductPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      { path: 'verify-email', element: <VerifyEmailPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'faq', element: <FaqPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'shipping', element: <ShippingPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'showcase', element: <ShowcasePage /> },

      { path: 'account', element: <AccountPage /> },
      { path: 'account/profile', element: <AccountProfilePage /> },
      { path: 'account/addresses', element: <AccountAddressesPage /> },
      { path: 'account/orders', element: <AccountOrdersPage /> },
      { path: 'account/orders/:id', element: <AccountOrderDetailPage /> },
      { path: 'account/wishlist', element: <AccountWishlistPage /> },

      { path: 'admin', element: <AdminDashboardPage /> },
      { path: 'admin/analytics', element: <AdminAnalyticsPage /> },
      { path: 'admin/categories', element: <AdminCategoriesPage /> },
      { path: 'admin/categories/new', element: <AdminCategoryNewPage /> },
      { path: 'admin/categories/:id/edit', element: <AdminCategoryEditPage /> },
      { path: 'admin/coupons', element: <AdminCouponsPage /> },
      { path: 'admin/coupons/new', element: <AdminCouponNewPage /> },
      { path: 'admin/coupons/:id/edit', element: <AdminCouponEditPage /> },
      { path: 'admin/customers', element: <AdminCustomersPage /> },
      { path: 'admin/customers/:id', element: <AdminCustomerDetailPage /> },
      { path: 'admin/inventory', element: <AdminInventoryPage /> },
      { path: 'admin/orders', element: <AdminOrdersPage /> },
      { path: 'admin/products', element: <AdminProductsPage /> },
      { path: 'admin/products/new', element: <AdminProductNewPage /> },
      { path: 'admin/products/:slug/edit', element: <AdminProductEditPage /> },
      { path: 'admin/products/:slug', element: <AdminProductDetailPage /> },
      { path: 'admin/settings', element: <AdminSettingsPage /> },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
