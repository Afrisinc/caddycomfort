import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StoreSettingsForm } from '@/components/admin/StoreSettingsForm';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SETTINGS_SECTIONS } from '@/lib/settingsForm';

const NAV = [
  ...SETTINGS_SECTIONS.map(({ id, title }) => ({ id, title })),
  { id: 'security', title: 'Security' },
];

function SettingsContent() {
  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader title="Settings" description="Store details, shipping, tax and payment rules" />

      <div className="grid gap-8 px-4 py-8 sm:px-8 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <nav aria-label="Settings sections" className="lg:sticky lg:top-24 lg:self-start">
          <ul className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:flex-col lg:gap-1 [&::-webkit-scrollbar]:hidden">
            {NAV.map((item) => (
              <li key={item.id} className="shrink-0">
                <a
                  href={`#${item.id}`}
                  className="block rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap text-foreground/75 transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent-rose/40"
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="max-w-3xl space-y-6">
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
