import { useEffect } from 'react';
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
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      toast.error('Please login to access this page');
      router.push('/login');
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
  }, [isAuthenticated, user, requiredRole, requireAdmin, router]);

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
