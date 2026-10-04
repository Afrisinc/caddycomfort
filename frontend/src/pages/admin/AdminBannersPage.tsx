import { useCallback, useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  GalleryHorizontal,
  MoreVertical,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from '@/components/common/Link';
import { ImageThumbnail } from '@/components/common/ImageThumbnail';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { CellMeta, CellTitle, DataCell, DataRow, DataTable } from '@/components/ui/data-table';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { StatusPill } from '@/components/ui/status-pill';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { heroBannersApi } from '@/lib/api';
import type { HeroBanner } from '@/types/api';

const COLUMNS = [
  { key: 'order', label: 'Order' },
  { key: 'slide', label: 'Slide' },
  { key: 'link', label: 'Button' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions', hideLabel: true },
] as const;

function BannersManagement() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<HeroBanner | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    try {
      setBanners(await heroBannersApi.getAll());
    } catch {
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const liveCount = banners.filter((b) => b.isActive).length;

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= banners.length) return;
    const next = [...banners];
    [next[index], next[target]] = [next[target], next[index]];
    const previous = banners;
    setBanners(next);
    setBusyId(next[target].id);
    try {
      setBanners(await heroBannersApi.reorder(next.map((b) => b.id)));
    } catch (error: any) {
      setBanners(previous);
      toast.error(error.message || 'Could not change the order');
    } finally {
      setBusyId(null);
    }
  };

  const toggle = async (banner: HeroBanner, isActive: boolean) => {
    setBusyId(banner.id);
    try {
      const updated = await heroBannersApi.update(banner.id, { isActive });
      setBanners((list) => list.map((b) => (b.id === updated.id ? updated : b)));
      toast.success(isActive ? 'Slide is live' : 'Slide hidden');
    } catch (error: any) {
      toast.error(error.message || 'Could not update the slide');
    } finally {
      setBusyId(null);
    }
  };

  const renderBody = () => {
    if (loadFailed) {
      return (
        <EmptyState
          icon={RefreshCw}
          title="We couldn't load your slides"
          description="Check your connection and try again."
          action={
            <Button variant="outline" onClick={load}>
              Try again
            </Button>
          }
        />
      );
    }
    if (!loading && banners.length === 0) {
      return (
        <EmptyState
          icon={GalleryHorizontal}
          title="No slides yet"
          description="Add your first slide to show a banner at the top of the home page."
          action={
            <Button asChild className="bg-accent-rose hover:bg-accent-rose-dark">
              <Link href="/admin/banners/new">Add slide</Link>
            </Button>
          }
        />
      );
    }
    return (
      <DataTable columns={COLUMNS} label="Home page slides" loading={loading} skeletonRows={3}>
        {banners.map((banner, index) => (
          <DataRow key={banner.id}>
            <DataCell>
              <div className="flex items-center gap-1">
                <span className="w-5 text-sm font-medium tabular-nums text-muted-foreground">
                  {index + 1}
                </span>
                <div className="flex flex-col">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-7"
                    aria-label={`Move ${banner.title} up`}
                    disabled={index === 0 || busyId !== null}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-7"
                    aria-label={`Move ${banner.title} down`}
                    disabled={index === banners.length - 1 || busyId !== null}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </DataCell>
            <DataCell>
              <div className="flex items-center gap-3">
                <ImageThumbnail
                  images={[banner.image]}
                  alt={banner.imageAlt}
                  size="md"
                  fallbackIcon={GalleryHorizontal}
                />
                <div className="min-w-0">
                  <CellTitle href={`/admin/banners/${banner.id}/edit`}>{banner.title}</CellTitle>
                  <CellMeta className="max-w-md">{banner.eyebrow}</CellMeta>
                </div>
              </div>
            </DataCell>
            <DataCell>
              <CellTitle>{banner.ctaText}</CellTitle>
              <CellMeta mono>{banner.ctaLink}</CellMeta>
            </DataCell>
            <DataCell>
              <div className="flex items-center gap-3">
                <Switch
                  checked={banner.isActive}
                  disabled={busyId === banner.id}
                  onCheckedChange={(checked) => toggle(banner, checked)}
                  aria-label={`${banner.isActive ? 'Hide' : 'Show'} ${banner.title}`}
                />
                <StatusPill tone={banner.isActive ? 'green' : 'neutral'}>
                  {banner.isActive ? 'Live' : 'Hidden'}
                </StatusPill>
              </div>
            </DataCell>
            <DataCell align="right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={`Actions for ${banner.title}`}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/banners/${banner.id}/edit`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View home page
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => setToDelete(banner)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </DataCell>
          </DataRow>
        ))}
      </DataTable>
    );
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader title="Home banners" description="The slides shown at the top of your home page">
        <Button asChild className="gap-2 bg-accent-rose hover:bg-accent-rose-dark">
          <Link href="/admin/banners/new">
            <Plus className="h-4 w-4" />
            Add slide
          </Link>
        </Button>
      </AdminHeader>

      <div className="px-4 py-8 sm:px-8">
        {!loading && !loadFailed && banners.length > 0 && (
          <p className="mb-5 text-sm text-muted-foreground">
            {liveCount} of {banners.length} {banners.length === 1 ? 'slide is' : 'slides are'} live.
            Slides play in the order below; the next two appear as previews beside the main banner.
          </p>
        )}
        {renderBody()}
      </div>

      <ConfirmDeleteDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete slide"
        description={
          toDelete ? (
            <>
              Delete <span className="font-medium text-foreground">{toDelete.title}</span>? This
              cannot be undone.
            </>
          ) : null
        }
        warning={
          liveCount === 1 && toDelete?.isActive
            ? 'This is your only live slide. The home page will have no banner without it.'
            : undefined
        }
        onConfirm={async () => {
          if (!toDelete) return;
          await heroBannersApi.delete(toDelete.id);
        }}
        onSuccess={() => {
          setToDelete(null);
          load();
        }}
        successMessage="Slide deleted"
      />
    </div>
  );
}

export default function AdminBannersPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <BannersManagement />
      </AdminLayout>
    </ProtectedRoute>
  );
}
