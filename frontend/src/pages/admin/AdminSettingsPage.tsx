import { useSearchParams } from 'react-router-dom';
import {
  CreditCard,
  KeyRound,
  Settings2,
  ShieldCheck,
  Store,
  Truck,
  type LucideIcon,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { LoginActivityPanel } from '@/components/admin/LoginActivityPanel';
import { StoreSettingsForm } from '@/components/admin/StoreSettingsForm';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SectionNav } from '@/components/common/SectionNav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SETTINGS_SECTIONS } from '@/lib/settingsForm';
import { useAuthStore } from '@/store/useAuthStore';

const ICONS: Record<string, LucideIcon> = {
  store: Store,
  shipping: Truck,
  payments: CreditCard,
  security: ShieldCheck,
};

const NAV = [
  ...SETTINGS_SECTIONS.map(({ id, title }) => ({ id, title, icon: ICONS[id] })),
  { id: 'security', title: 'Security', icon: ICONS.security },
];

const GENERAL = 'general';
const LOGIN_ACTIVITY = 'login-activity';

function GeneralSettings() {
  return (
    <div className="grid gap-6 xl:grid-cols-[12rem_minmax(0,1fr)] xl:gap-10">
      <SectionNav items={NAV} label="Settings sections" />
      <div className="min-w-0 space-y-6">
        <StoreSettingsForm />
        <ChangePasswordForm id="security" />
      </div>
    </div>
  );
}

function SettingsContent() {
  const isSuperAdmin = useAuthStore((state) => state.user?.role === 'SUPER_ADMIN');
  const [params, setParams] = useSearchParams();
  const tab = isSuperAdmin && params.get('tab') === LOGIN_ACTIVITY ? LOGIN_ACTIVITY : GENERAL;

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader title="Settings" description="Store details, shipping, tax and payment rules" />

      <div className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-8">
        {isSuperAdmin ? (
          <Tabs
            variant="underline"
            value={tab}
            onValueChange={(value) =>
              setParams(value === GENERAL ? {} : { tab: value }, { replace: true })
            }
          >
            <TabsList aria-label="Settings" className="mt-4 mb-6 sm:mt-6">
              <TabsTrigger value={GENERAL}>
                <Settings2 />
                General
              </TabsTrigger>
              <TabsTrigger value={LOGIN_ACTIVITY}>
                <KeyRound />
                Login activity
              </TabsTrigger>
            </TabsList>
            <TabsContent value={GENERAL}>
              <GeneralSettings />
            </TabsContent>
            <TabsContent value={LOGIN_ACTIVITY}>
              <LoginActivityPanel />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="xl:pt-8">
            <GeneralSettings />
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <SettingsContent />
      </AdminLayout>
    </ProtectedRoute>
  );
}
