import { useEffect } from 'react';
import { useRouter } from '@/router/compat';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from '@/components/common/Link';
import { useAuthStore } from '@/store/useAuthStore';
import { ArrowLeft, Package, Truck, CheckCircle } from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const orders = [
    { id: 'ORD-2024-001', date: '2024-01-15', total: 'Rwf 299,000', status: 'Delivered', items: 2 },
    {
      id: 'ORD-2024-002',
      date: '2024-01-20',
      total: 'Rwf 189,000',
      status: 'In Transit',
      items: 1,
    },
    {
      id: 'ORD-2024-003',
      date: '2024-01-25',
      total: 'Rwf 450,000',
      status: 'Processing',
      items: 3,
    },
  ];

  const getStatusIcon = (status: string) => {
    if (status === 'Delivered') return <CheckCircle className="h-5 w-5" />;
    if (status === 'In Transit') return <Truck className="h-5 w-5" />;
    return <Package className="h-5 w-5" />;
  };

  const getStatusColor = (status: string) => {
    if (status === 'Delivered') return 'bg-green-100 text-green-800';
    if (status === 'In Transit') return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/account"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Account
          </Link>

          <h1 className="text-4xl font-serif mb-8">Order History</h1>

          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-card border rounded-lg p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{order.id}</h3>
                    <p className="text-sm text-muted-foreground">
                      Placed on {new Date(order.date).toLocaleDateString()} • {order.items} items
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-lg">{order.total}</p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </Badge>
                  </div>
                </div>
                <Link href={`/account/orders/${order.id}`}>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
