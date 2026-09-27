import { CreditCard, ShieldCheck, Store, Truck, type LucideIcon } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StoreSettingsForm } from '@/components/admin/StoreSettingsForm';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SectionNav } from '@/components/common/SectionNav';
import { SETTINGS_SECTIONS } from '@/lib/settingsForm';

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

function SettingsContent() {
  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader title="Settings" description="Store details, shipping, tax and payment rules" />

      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-8 sm:px-8 xl:grid-cols-[12rem_minmax(0,1fr)] xl:gap-10 xl:pt-8">
        <SectionNav items={NAV} label="Settings sections" />
        <div className="min-w-0 space-y-6">
          <StoreSettingsForm />
          <ChangePasswordForm id="security" />
        </div>
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
