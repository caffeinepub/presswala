import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useGetAllOrders } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate, formatItemBreakdown } from '../lib/appUtils';
import { OrderStatus } from '../backend';
import { IndianRupee, TrendingUp, Clock, CheckCircle2, Banknote, CreditCard } from 'lucide-react';
import type { Order } from '../backend';

const STATUS_BADGE: Record<string, string> = {
  [OrderStatus.delivered]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  [OrderStatus.pending]: 'bg-amber-100 text-amber-700 border-amber-200',
  [OrderStatus.accepted]: 'bg-blue-100 text-blue-700 border-blue-200',
  [OrderStatus.pickedUp]: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  [OrderStatus.ironing]: 'bg-violet-100 text-violet-700 border-violet-200',
  [OrderStatus.cancelled]: 'bg-red-100 text-red-700 border-red-200',
};

function PaymentMethodBadge({ method }: { method: string }) {
  if (method === 'cash') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800">
        <Banknote className="w-3 h-3" />
        Cash
      </span>
    );
  }
  if (method === 'online') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800">
        <CreditCard className="w-3 h-3" />
        Online
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border capitalize">
      {method || '—'}
    </span>
  );
}

type FilterTab = 'all' | 'cash' | 'online';

function PaymentsContent() {
  const { data: orders, isLoading } = useGetAllOrders();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const allSorted: Order[] = orders
    ? [...orders].sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
    : [];

  const filtered: Order[] =
    activeTab === 'all'
      ? allSorted
      : allSorted.filter((o) => o.paymentMethod === activeTab);

  const totalRevenue = orders
    ? orders.reduce((sum, o) => sum + Number(o.totalAmount), 0)
    : 0;

  const completedPayments = orders
    ? orders
        .filter((o) => o.status === OrderStatus.delivered)
        .reduce((sum, o) => sum + Number(o.totalAmount), 0)
    : 0;

  const pendingPayments = orders
    ? orders
        .filter((o) => o.status !== OrderStatus.delivered && o.status !== OrderStatus.cancelled)
        .reduce((sum, o) => sum + Number(o.totalAmount), 0)
    : 0;

  const cashRevenue = orders
    ? orders
        .filter((o) => o.paymentMethod === 'cash')
        .reduce((sum, o) => sum + Number(o.totalAmount), 0)
    : 0;

  const onlineRevenue = orders
    ? orders
        .filter((o) => o.paymentMethod === 'online')
        .reduce((sum, o) => sum + Number(o.totalAmount), 0)
    : 0;

  const summaryCards = [
    {
      label: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: 'bg-primary/10 text-primary',
    },
    {
      label: 'Completed Payments',
      value: `₹${completedPayments.toLocaleString('en-IN')}`,
      icon: CheckCircle2,
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Pending Payments',
      value: `₹${pendingPayments.toLocaleString('en-IN')}`,
      icon: Clock,
      color: 'bg-amber-100 text-amber-700',
    },
    {
      label: 'Total Orders',
      value: (orders?.length ?? 0).toString(),
      icon: TrendingUp,
      color: 'bg-blue-100 text-blue-700',
    },
  ];

  const truncateId = (id: string) => `...${id.slice(-6)}`;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Payments</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Revenue and payment tracking</p>
      </div>

      {/* Summary cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <Card key={card.label} className="border border-border shadow-sm">
              <CardContent className="p-4">
                <div
                  className={`w-9 h-9 rounded-lg ${card.color} flex items-center justify-center mb-2`}
                >
                  <card.icon className="w-4 h-4" />
                </div>
                <p className="text-xl font-extrabold text-foreground">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Payment method split */}
      {!isLoading && orders && orders.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <Card className="border border-amber-200 bg-amber-50/50 dark:bg-amber-950/10 dark:border-amber-900">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <Banknote className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-lg font-extrabold text-foreground">
                  ₹{cashRevenue.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-muted-foreground">Cash Revenue</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-blue-200 bg-blue-50/50 dark:bg-blue-950/10 dark:border-blue-900">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-lg font-extrabold text-foreground">
                  ₹{onlineRevenue.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-muted-foreground">Online Revenue</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Orders table with filter tabs */}
      <Card>
        <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-4">
          <h2 className="font-bold text-base text-foreground">Order Payments</h2>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)}>
            <TabsList className="h-8">
              <TabsTrigger value="all" className="text-xs px-3 h-6">
                All{orders ? ` (${orders.length})` : ''}
              </TabsTrigger>
              <TabsTrigger value="cash" className="text-xs px-3 h-6 gap-1">
                <Banknote className="w-3 h-3" />
                Cash
              </TabsTrigger>
              <TabsTrigger value="online" className="text-xs px-3 h-6 gap-1">
                <CreditCard className="w-3 h-3" />
                Online
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
            {activeTab === 'all' ? 'No orders found' : `No ${activeTab} payment orders found`}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead className="hidden md:table-cell">Customer</TableHead>
                <TableHead className="hidden lg:table-cell">Items</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => (
                <TableRow
                  key={order.id.toString()}
                  className="hover:bg-muted/40 transition-colors"
                >
                  <TableCell className="font-mono text-xs font-medium">
                    #{order.id.toString()}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <code className="text-xs font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                      {truncateId(order.customerId.toString())}
                    </code>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {formatItemBreakdown(order)}
                  </TableCell>
                  <TableCell className="font-bold text-primary">
                    ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell>
                    <PaymentMethodBadge method={order.paymentMethod} />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${
                        STATUS_BADGE[order.status] ?? 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

export default function AdminPaymentsPage() {
  return (
    <AdminLayout>
      <PaymentsContent />
    </AdminLayout>
  );
}
