import { useEffect, useState } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { postAuthPath } from '@/lib/authForm';
import { useRouter, useSearchParams } from '@/router/compat';
import { useAuthStore } from '@/store/useAuthStore';

type AuthTab = 'login' | 'register';

const TAB_COPY: Record<AuthTab, { title: string; description: string }> = {
  login: {
    title: 'Welcome back',
    description: 'Sign in to track your orders and check out faster.',
  },
  register: {
    title: 'Create your account',
    description: 'Join to track your orders, save favourites and check out faster.',
  },
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [tab, setTab] = useState<AuthTab>(
    searchParams.get('tab') === 'register' ? 'register' : 'login',
  );

  useEffect(() => {
    if (isAuthenticated) router.replace(postAuthPath(user, redirect));
  }, [isAuthenticated, user, redirect, router]);

  return (
    <AuthLayout title={TAB_COPY[tab].title} description={TAB_COPY[tab].description}>
      <Tabs value={tab} onValueChange={(value) => setTab(value as AuthTab)}>
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="login">Sign in</TabsTrigger>
          <TabsTrigger value="register">Create account</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <LoginForm />
        </TabsContent>
        <TabsContent value="register">
          <RegisterForm />
        </TabsContent>
      </Tabs>
    </AuthLayout>
  );
}
