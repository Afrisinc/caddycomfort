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
      { index: true, element: <HomePage />, handle: {} },
      {
        path: 'shop',
        element: <ShopPage />,
        handle: {
          title: 'Shop',
          description:
            'Shop CaddyComfort — pieces made for comfort and confidence. New arrivals, flash sales and best sellers.',
        },
      },
      { path: 'shop/:id', element: <ShopProductPage />, handle: { dynamic: true } },
      { path: 'cart', element: <CartPage />, handle: { title: 'Your Cart', noindex: true } },
      { path: 'checkout', element: <CheckoutPage />, handle: { title: 'Checkout', noindex: true } },
      { path: 'search', element: <SearchPage />, handle: { title: 'Search', noindex: true } },
      { path: 'login', element: <LoginPage />, handle: { title: 'Sign In', noindex: true } },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
        handle: { title: 'Forgot Password', noindex: true },
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
        handle: { title: 'Reset Password', noindex: true },
      },
      {
        path: 'verify-email',
        element: <VerifyEmailPage />,
        handle: { title: 'Verify Email', noindex: true },
      },
      {
        path: 'about',
        element: <AboutPage />,
        handle: {
          title: 'About Us',
          description:
            "The story behind Caddy — gym wear made for every woman's body and how she moves. Our mission, vision and values.",
        },
      },
      {
        path: 'contact',
        element: <ContactPage />,
        handle: {
          title: 'Contact Us',
          description:
            'Get in touch with the CaddyComfort team for orders, sizing, delivery or any other questions.',
        },
      },
      {
        path: 'faq',
        element: <FaqPage />,
        handle: {
          title: 'FAQ',
          description:
            'Answers to common questions about ordering, payment, delivery and returns at CaddyComfort.',
        },
      },
      { path: 'privacy', element: <PrivacyPage />, handle: { title: 'Privacy Policy' } },
      {
        path: 'shipping',
        element: <ShippingPage />,
        handle: {
          title: 'Shipping & Returns',
          description: 'Delivery times, shipping costs and our returns policy at CaddyComfort.',
        },
      },
      { path: 'terms', element: <TermsPage />, handle: { title: 'Terms of Service' } },
      { path: 'showcase', element: <ShowcasePage />, handle: { title: 'Showcase', noindex: true } },

      { path: 'account', element: <AccountPage />, handle: { title: 'My Account', noindex: true } },
      {
        path: 'account/profile',
        element: <AccountProfilePage />,
        handle: { title: 'My Account', noindex: true },
      },
      {
        path: 'account/addresses',
        element: <AccountAddressesPage />,
        handle: { title: 'My Account', noindex: true },
      },
      {
        path: 'account/orders',
        element: <AccountOrdersPage />,
        handle: { title: 'My Account', noindex: true },
      },
      {
        path: 'account/orders/:id',
        element: <AccountOrderDetailPage />,
        handle: { title: 'My Account', noindex: true },
      },
      {
        path: 'account/wishlist',
        element: <AccountWishlistPage />,
        handle: { title: 'My Account', noindex: true },
      },

      { path: 'admin', element: <AdminDashboardPage />, handle: { title: 'Admin', noindex: true } },
      {
        path: 'admin/analytics',
        element: <AdminAnalyticsPage />,
        handle: { title: 'Admin', noindex: true },
      },
      {
        path: 'admin/categories',
        element: <AdminCategoriesPage />,
        handle: { title: 'Admin', noindex: true },
      },
      {
        path: 'admin/categories/new',
        element: <AdminCategoryNewPage />,
        handle: { title: 'Admin', noindex: true },
      },
      {
        path: 'admin/categories/:id/edit',
        element: <AdminCategoryEditPage />,
        handle: { title: 'Admin', noindex: true },
      },
      {
        path: 'admin/coupons',
        element: <AdminCouponsPage />,
        handle: { title: 'Admin', noindex: true },
      },
      {
        path: 'admin/coupons/new',
        element: <AdminCouponNewPage />,
        handle: { title: 'Admin', noindex: true },
      },
      {
        path: 'admin/coupons/:id/edit',
        element: <AdminCouponEditPage />,
        handle: { title: 'Admin', noindex: true },
      },
      {
        path: 'admin/customers',
        element: <AdminCustomersPage />,
        handle: { title: 'Admin', noindex: true },
      },
      {
        path: 'admin/customers/:id',
        element: <AdminCustomerDetailPage />,
        handle: { title: 'Admin', noindex: true },
      },
      {
        path: 'admin/inventory',
        element: <AdminInventoryPage />,
        handle: { title: 'Admin', noindex: true },
      },
      {
        path: 'admin/orders',
        element: <AdminOrdersPage />,
        handle: { title: 'Admin', noindex: true },
      },
      {
        path: 'admin/products',
        element: <AdminProductsPage />,
        handle: { title: 'Admin', noindex: true },
      },
      {
        path: 'admin/products/new',
        element: <AdminProductNewPage />,
        handle: { title: 'Admin', noindex: true },
      },
      {
        path: 'admin/products/:slug/edit',
        element: <AdminProductEditPage />,
        handle: { title: 'Admin', noindex: true },
      },
      {
        path: 'admin/products/:slug',
        element: <AdminProductDetailPage />,
        handle: { title: 'Admin', noindex: true },
      },
      {
        path: 'admin/settings',
        element: <AdminSettingsPage />,
        handle: { title: 'Admin', noindex: true },
      },

      { path: '*', element: <NotFoundPage />, handle: { title: 'Page Not Found', noindex: true } },
    ],
  },
]);
