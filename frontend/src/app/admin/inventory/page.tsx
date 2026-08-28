'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Download,
  Upload,
  AlertTriangle,
  Package,
  TrendingDown,
  TrendingUp,
  MoreVertical,
  Edit,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdjustStockDialog } from '@/components/admin/AdjustStockDialog';
import { StockHistoryDialog } from '@/components/admin/StockHistoryDialog';
import { ImportStockDialog } from '@/components/admin/ImportStockDialog';
import { inventoryApi } from '@/lib/api';
import {
  InventorySummary,
  InventoryValuationItem,
  RestockRecommendation,
} from '@/types/api';
import { formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';

type StockTier = 'out' | 'critical' | 'low' | 'good';

function getStockTier(quantity: number): StockTier {
  if (quantity <= 0) return 'out';
  if (quantity <= 3) return 'critical';
  if (quantity <= 10) return 'low';
  return 'good';
}

const TIER_CONFIG: Record<StockTier, { label: string; className: string }> = {
  good: { label: 'In Stock', className: 'bg-green-100 text-green-700' },
  low: { label: 'Low Stock', className: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Critical', className: 'bg-red-100 text-red-700' },
  out: { label: 'Out of Stock', className: 'bg-gray-100 text-gray-700' },
};

function formatK(amount: number): string {
  return `Rwf ${(amount / 1000).toFixed(0)}K`;
}

function escapeCsvField(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((row) => row.map(escapeCsvField).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function Inventory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'good' | 'low' | 'out'>('all');
  const [items, setItems] = useState<InventoryValuationItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [recommendations, setRecommendations] = useState<RestockRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [adjustTarget, setAdjustTarget] = useState<InventoryValuationItem | null>(null);
  const [historyTarget, setHistoryTarget] = useState<InventoryValuationItem | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const [valuation, summaryData, recs] = await Promise.all([
        inventoryApi.getValuation(),
        inventoryApi.getSummary(),
        inventoryApi.getRestockRecommendations(),
      ]);
      setItems(valuation.items);
      setSummary(summaryData);
      setRecommendations(recs);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load inventory');
    } finally {
      setIsLoading(false);
    }
  };

  const recommendationByProduct = useMemo(
    () => new Map(recommendations.map((r) => [r.productId, r])),
    [recommendations]
  );

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());

    const tier = getStockTier(item.quantity);
    const matchesFilter =
      stockFilter === 'all' ||
      (stockFilter === 'low' && (tier === 'low' || tier === 'critical')) ||
      (stockFilter === 'out' && tier === 'out') ||
      (stockFilter === 'good' && tier === 'good');

    return matchesSearch && matchesFilter;
  });

  const statCards = summary
    ? [
        { title: 'Total Products', value: summary.totalProducts.toLocaleString(), icon: Package, alert: false },
        { title: 'Low Stock Items', value: summary.lowStockCount.toLocaleString(), icon: AlertTriangle, alert: summary.lowStockCount > 0 },
        { title: 'Out of Stock', value: summary.outOfStockCount.toLocaleString(), icon: TrendingDown, alert: summary.outOfStockCount > 0 },
        { title: 'Total Stock Value', value: formatK(summary.totalInventoryValue), icon: TrendingUp, alert: false },
      ]
    : [];

  const handleExport = () => {
    const rows: (string | number)[][] = [
      ['SKU', 'Product', 'Category', 'Current Stock', 'Unit Price (Rwf)', 'Total Value (Rwf)', 'Status', 'Last Restocked'],
      ...filteredItems.map((item) => [
        item.sku,
        item.productName,
        item.category,
        item.quantity,
        item.unitPrice,
        item.totalValue,
        TIER_CONFIG[getStockTier(item.quantity)].label,
        item.lastRestockedAt ? new Date(item.lastRestockedAt).toISOString().slice(0, 10) : 'Never',
      ]),
    ];
    downloadCsv(`inventory-${new Date().toISOString().slice(0, 10)}.csv`, rows);
    toast.success('Inventory exported');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader title="Inventory Management" description="Monitor and manage stock levels">
        <Button variant="outline" onClick={handleExport} disabled={filteredItems.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button className="bg-accent-rose hover:bg-accent-rose-dark" onClick={() => setImportOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Import Stock
        </Button>
      </AdminHeader>

      <div className="px-4 sm:px-8 py-8">
        {/* Stats */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }, (_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                  <Skeleton className="h-7 w-16 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.alert ? 'bg-orange-50' : 'bg-accent-rose/10'}`}>
                      <stat.icon className={`h-6 w-6 ${stat.alert ? 'text-orange-600' : 'text-accent-rose'}`} />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by product name or SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={stockFilter} onValueChange={(v) => setStockFilter(v as typeof stockFilter)}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="good">In Stock</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Items ({filteredItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {(
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Product</th>
                        <th className="text-left py-3 px-4 font-semibold">Current Stock</th>
                        <th className="text-left py-3 px-4 font-semibold">Last Restocked</th>
                        <th className="text-left py-3 px-4 font-semibold">Value</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                        <th className="text-right py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading
                        ? Array.from({ length: 6 }, (_, i) => (
                            <tr key={i} className="border-b">
                              {Array.from({ length: 6 }, (_, j) => (
                                <td key={j} className="py-4 px-4">
                                  <Skeleton className="h-4 w-full max-w-24" />
                                </td>
                              ))}
                            </tr>
                          ))
                        : filteredItems.map((item) => {
                        const tier = getStockTier(item.quantity);
                        const tierConfig = TIER_CONFIG[tier];
                        const recommendation = recommendationByProduct.get(item.productId);

                        return (
                          <tr key={item.productId} className="border-b hover:bg-muted/50">
                            <td className="py-4 px-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{item.productName}</p>
                                  {!item.isActive && (
                                    <Badge variant="outline" className="text-xs text-muted-foreground">
                                      Draft
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {item.sku} • {item.category}
                                </p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <p className="font-semibold">{item.quantity}</p>
                              {recommendation && (
                                <p className="text-xs text-orange-600">
                                  Restock {recommendation.recommendedRestockQuantity}
                                  {recommendation.priority === 'HIGH' ? ' (urgent)' : ''}
                                </p>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm">{formatRelativeTime(item.lastRestockedAt)}</p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="font-medium">{formatK(item.totalValue)}</p>
                            </td>
                            <td className="py-4 px-4">
                              <Badge className={tierConfig.className}>{tierConfig.label}</Badge>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setAdjustTarget(item)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Adjust Stock
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setHistoryTarget(item)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View History
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {!isLoading && filteredItems.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No inventory items found</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {adjustTarget && (
        <AdjustStockDialog
          open={!!adjustTarget}
          onOpenChange={(open) => !open && setAdjustTarget(null)}
          productId={adjustTarget.productId}
          productName={adjustTarget.productName}
          currentStock={adjustTarget.quantity}
          onSuccess={fetchAll}
        />
      )}

      {historyTarget && (
        <StockHistoryDialog
          open={!!historyTarget}
          onOpenChange={(open) => !open && setHistoryTarget(null)}
          productId={historyTarget.productId}
          productName={historyTarget.productName}
        />
      )}

      <ImportStockDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        items={items}
        onSuccess={fetchAll}
      />
    </div>
  );
}

export default function InventoryPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <Inventory />
      </AdminLayout>
    </ProtectedRoute>
  );
}
