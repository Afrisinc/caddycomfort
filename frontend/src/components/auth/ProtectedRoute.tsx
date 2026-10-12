import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useRouter } from '@/router/compat';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'SUPER_ADMIN' | 'CUSTOMER';
  requireAdmin?: boolean;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { pathname, search } = useLocation();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Send unauthenticated visitors to login, then back here once signed in.
    // Session-expiry messaging is handled by the API client.
    if (!isAuthenticated || !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname + search)}`);
      return;
    }

    // Check if admin access is required
    if (requireAdmin) {
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        toast.error('You do not have permission to access this page');
        router.push('/');
        return;
      }
    }

    // Check specific role requirement
    if (requiredRole && user.role !== requiredRole) {
      toast.error('You do not have permission to access this page');
      router.push('/');
      return;
    }
  }, [isAuthenticated, user, requiredRole, requireAdmin, router, pathname, search]);

  // Don't render children until authentication is verified
  if (!isAuthenticated || !user) {
    return null;
  }

  // Don't render if user doesn't have required permissions
  if (requireAdmin && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
