import { useCallback, useEffect, useState } from 'react';
import { StatusPill } from '@/components/ui/status-pill';
import { useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Boxes,
  ExternalLink,
  Eye,
  EyeOff,
  History,
  MessageSquare,
  MoreHorizontal,
  PackageX,
  Pencil,
  ShoppingBag,
  Star,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from '@/router/compat';
import Link from '@/components/common/Link';
import { EmptyState } from '@/components/common/EmptyState';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdjustStockDialog } from '@/components/admin/AdjustStockDialog';
import { StockHistoryDialog } from '@/components/admin/StockHistoryDialog';
import { StatCard, StatGrid } from '@/components/admin/StatCard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProductGallery } from '@/components/products/ProductGallery';
import { PriceDisplay } from '@/components/products/PriceDisplay';
import { RatingStars } from '@/components/products/RatingStars';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FormSection } from '@/components/ui/form-section';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { DetailList, Text } from '@/components/ui/typography';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { productsApi } from '@/lib/api';
import { getProductPricing } from '@/lib/pricing';
import { swatchColor } from '@/lib/swatches';
import type { Product } from '@/types/api';

const LOW_STOCK = 10;

function findProduct(handle: string): Promise<Product> {
  return productsApi.getBySlug(handle).catch(() => productsApi.getById(handle));
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { dateStyle: 'medium' });
}

function Chips({ items, swatches }: Readonly<{ items: string[]; swatches?: boolean }>) {
  if (items.length === 0) return <Text variant="small">None</Text>;
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => {
        const color = swatches ? swatchColor(item) : undefined;
        return (
          <li
            key={item}
            className="inline-flex h-8 items-center gap-2 rounded-full border bg-background px-3 text-sm"
          >
            {color && (
              <span
                aria-hidden="true"
                className="h-3.5 w-3.5 rounded-full border border-black/10"
                style={{ backgroundColor: color }}
              />
            )}
            {item}
          </li>
        );
      })}
    </ul>
  );
}

function DetailSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" aria-hidden="true">
      <Skeleton className="aspect-square w-full rounded-2xl" />
      <div className="space-y-6">
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    </div>
  );
}

function ProductDetail() {
  const { slug = '' } = useParams<{ slug: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');
  const [dialog, setDialog] = useState<'stock' | 'history' | 'delete' | null>(null);

  const load = useCallback(async () => {
    try {
      setProduct(await findProduct(slug));
      setStatus('ready');
    } catch {
      setStatus('missing');
    }
  }, [slug]);

  useEffect(() => {
    setStatus('loading');
    load();
  }, [load]);

  const toggleVisibility = async () => {
    if (!product) return;
    try {
      const updated = await productsApi.update(product.id, { isActive: !product.isActive });
      setProduct((current) => (current ? { ...current, isActive: updated.isActive } : current));
      toast.success(
        updated.isActive ? 'Product is now visible in the shop' : 'Product hidden from the shop',
      );
    } catch (error: any) {
      toast.error(error.message || 'Could not update the product');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-muted/30">
        <AdminHeader title="Product" description="Loading…" />
        <div className="px-4 py-8 sm:px-8">
          <DetailSkeleton />
        </div>
      </div>
    );
  }

  if (status === 'missing' || !product) {
    return (
      <div className="min-h-screen bg-muted/30">
        <AdminHeader title="Product" />
        <div className="px-4 py-8 sm:px-8">
          <EmptyState
            icon={PackageX}
            title="Product not found"
            description="It may have been deleted or its address changed."
            action={
              <Button asChild variant="outline">
                <Link href="/admin/products">Back to products</Link>
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const pricing = getProductPricing(product);
  const images = product.images?.length
    ? product.images
    : product.imageUrl
      ? [product.imageUrl]
      : [];
  const stock = product.stockQuantity ?? 0;
  const orderCount = product._count?.orderItems ?? 0;
  const reviews = product.reviews ?? [];
  const reviewCount = product._count?.reviews ?? reviews.length;
  const averageRating =
    product.averageRating ??
    (reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0);
  const editHref = `/admin/products/${product.slug}/edit`;

  let stockTone: 'green' | 'amber' | 'red' = 'green';
  if (stock <= 0) stockTone = 'red';
  else if (stock <= LOW_STOCK) stockTone = 'amber';

  const deleteBlocker =
    orderCount > 0
      ? `This product appears in ${orderCount} order${orderCount === 1 ? '' : 's'}, so it can't be deleted. Hide it from the shop instead.`
      : null;

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader
        title={product.name}
        description={`${product.category?.name ?? 'Uncategorized'} · ${product.sku}`}
      >
        <Button asChild variant="outline" className="hidden gap-2 sm:inline-flex">
          <Link href={`/shop/${product.id}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            View in shop
          </Link>
        </Button>
        <Button asChild className="gap-2 bg-accent-rose hover:bg-accent-rose-dark">
          <Link href={editHref}>
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label="More actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onSelect={() => setDialog('stock')}>
              <Boxes className="mr-2 h-4 w-4" />
              Adjust stock
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setDialog('history')}>
              <History className="mr-2 h-4 w-4" />
              Stock history
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={toggleVisibility}>
              {product.isActive ? (
                <EyeOff className="mr-2 h-4 w-4" />
              ) : (
                <Eye className="mr-2 h-4 w-4" />
              )}
              {product.isActive ? 'Hide from shop' : 'Show in shop'}
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="sm:hidden">
              <Link href={`/shop/${product.id}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                View in shop
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => setDialog('delete')}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </AdminHeader>

      <div className="space-y-6 px-4 py-8 sm:px-8">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All products
        </Link>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ProductGallery
              images={images}
              name={product.name}
              hasDiscount={pricing.discountPct > 0}
              discountPct={pricing.discountPct}
            />
          </div>

          <div className="space-y-6">
            <FormSection title="Overview">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone={product.isActive ? 'green' : 'neutral'}>
                  {product.isActive ? 'Visible in shop' : 'Draft — hidden'}
                </StatusPill>
                {product.isFeatured && <StatusPill tone="rose">Featured</StatusPill>}
              </div>
              <PriceDisplay pricing={pricing} size="lg" />
              <DetailList
                bordered={false}
                className="-mb-2 border-t"
                items={[
                  {
                    label: 'Category',
                    value: product.category ? (
                      <Link
                        href={`/admin/categories/${product.category.id}/edit`}
                        className="hover:text-accent-rose hover:underline"
                      >
                        {product.category.name}
                      </Link>
                    ) : (
                      'Uncategorized'
                    ),
                  },
                  { label: 'SKU', value: <code className="font-mono text-xs">{product.sku}</code> },
                  {
                    label: 'URL handle',
                    value: <code className="font-mono text-xs">{product.slug}</code>,
                  },
                  { label: 'Created', value: formatDate(product.createdAt) },
                  { label: 'Last updated', value: formatDate(product.updatedAt) },
                ]}
              />
            </FormSection>

            <div>
              <StatGrid columns={3} className="mb-0">
                <StatCard
                  title="In stock"
                  value={stock.toLocaleString()}
                  icon={Boxes}
                  tone={stockTone}
                  hint={stock <= 0 ? 'Sold out' : stock <= LOW_STOCK ? 'Running low' : 'Healthy'}
                />
                <StatCard
                  title="Orders"
                  value={orderCount.toLocaleString()}
                  icon={ShoppingBag}
                  tone="blue"
                  hint="Times ordered"
                />
                <StatCard
                  title="Reviews"
                  value={reviewCount.toLocaleString()}
                  icon={Star}
                  tone="violet"
                  hint={reviewCount ? `${averageRating.toFixed(1)} average` : 'No reviews yet'}
                />
              </StatGrid>
            </div>

            <FormSection title="Description">
              <Text className="whitespace-pre-line">
                {product.description || 'No description yet.'}
              </Text>
            </FormSection>

            <FormSection
              title="Options"
              description="What customers can choose on the product page."
            >
              <DetailList
                bordered={false}
                className="-my-3"
                items={[
                  { label: 'Sizes', value: <Chips items={product.sizes ?? []} /> },
                  { label: 'Colors', value: <Chips items={product.colors ?? []} swatches /> },
                  ...((product.tags?.length ?? 0) > 0
                    ? [{ label: 'Tags', value: <Chips items={product.tags} /> }]
                    : []),
                ]}
              />
            </FormSection>

            <FormSection
              title="Latest reviews"
              description={
                reviewCount > reviews.length
                  ? `Showing ${reviews.length} of ${reviewCount}`
                  : undefined
              }
            >
              {reviews.length === 0 ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  No reviews yet.
                </p>
              ) : (
                <ul className="divide-y">
                  {reviews.slice(0, 5).map((review) => (
                    <li key={review.id} className="space-y-1.5 py-4 first:pt-0 last:pb-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-medium">
                          {review.user?.name || review.user?.firstName || 'Customer'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      <RatingStars rating={review.rating} />
                      {review.comment && <Text variant="small">{review.comment}</Text>}
                    </li>
                  ))}
                </ul>
              )}
            </FormSection>
          </div>
        </div>
      </div>

      <AdjustStockDialog
        open={dialog === 'stock'}
        onOpenChange={(open) => setDialog(open ? 'stock' : null)}
        productId={product.id}
        productName={product.name}
        currentStock={stock}
        onSuccess={load}
      />
      <StockHistoryDialog
        open={dialog === 'history'}
        onOpenChange={(open) => setDialog(open ? 'history' : null)}
        productId={product.id}
        productName={product.name}
      />
      <ConfirmDeleteDialog
        open={dialog === 'delete'}
        onOpenChange={(open) => setDialog(open ? 'delete' : null)}
        title="Delete product"
        description={
          <>
            Delete <span className="font-medium text-foreground">{product.name}</span>? This cannot
            be undone.
          </>
        }
        warning={deleteBlocker ?? undefined}
        blocked={!!deleteBlocker}
        onConfirm={() => productsApi.delete(product.id)}
        onSuccess={() => router.push('/admin/products')}
        successMessage="Product deleted"
      />
    </div>
  );
}

export default function AdminProductDetailPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <ProductDetail />
      </AdminLayout>
    </ProtectedRoute>
  );
}
