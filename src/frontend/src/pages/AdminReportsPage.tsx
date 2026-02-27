import AdminLayout from '../components/AdminLayout';
import { useGetAdminStats, useGetAllOrders } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { OrderStatus } from '../backend';
import { BarChart2, TrendingUp, IndianRupee, Package, Calendar } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  [OrderStatus.pending]: 'bg-amber-100 text-amber-700 border-amber-200',
  [OrderStatus.accepted]: 'bg-blue-100 text-blue-700 border-blue-200',
  [OrderStatus.pickedUp]: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  [OrderStatus.ironing]: 'bg-violet-100 text-violet-700 border-violet-200',
  [OrderStatus.delivered]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  [OrderStatus.cancelled]: 'bg-red-100 text-red-700 border-red-200',
};

function ReportsContent() {
  const { data: stats, isLoading: statsLoading } = useGetAdminStats();
  const { data: orders, isLoading: ordersLoading } = useGetAllOrders();

  const isLoading = statsLoading || ordersLoading;

  // Monthly revenue — orders in current calendar month
  const now = new Date();
  const monthlyRevenue = orders
    ? orders.reduce((sum, o) => {
        const d = new Date(Number(o.createdAt) / 1_000_000);
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
          return sum + Number(o.totalAmount);
        }
        return sum;
      }, 0)
    : 0;

  // Status breakdown
  const statusBreakdown = Object.values(OrderStatus).map((status) => {
    const count = orders?.filter((o) => o.status === status).length ?? 0;
    const revenue = orders
      ? orders.filter((o) => o.status === status).reduce((s, o) => s + Number(o.totalAmount), 0)
      : 0;
    return { status, count, revenue };
  });

  // Top area by order count (using address string grouping as proxy)
  const areaMap = new Map<string, number>();
  orders?.forEach((o) => {
    const area = o.address.split(',').pop()?.trim() ?? 'Unknown';
    areaMap.set(area, (areaMap.get(area) ?? 0) + 1);
  });
  const topArea = [...areaMap.entries()].sort((a, b) => b[1] - a[1])[0];

  const summaryCards = [
    {
      label: 'Orders Today',
      value: stats ? Number(stats.totalOrdersToday).toString() : '—',
      icon: Calendar,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Monthly Revenue',
      value: `₹${monthlyRevenue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: 'bg-primary/10 text-primary',
    },
    {
      label: 'Active Orders',
      value: stats ? Number(stats.activeOrders).toString() : '—',
      icon: Package,
      color: 'bg-orange-100 text-orange-700',
    },
    {
      label: 'Top Area',
      value: topArea ? topArea[0] : '—',
      subValue: topArea ? `${topArea[1]} orders` : '',
      icon: TrendingUp,
      color: 'bg-emerald-100 text-emerald-700',
    },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Business intelligence and analytics</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <Card key={card.label} className="border border-border shadow-sm">
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-lg ${card.color} flex items-center justify-center mb-2`}>
                  <card.icon className="w-4 h-4" />
                </div>
                <p className="text-xl font-extrabold text-foreground leading-tight">{card.value}</p>
                {card.subValue && (
                  <p className="text-xs text-muted-foreground">{card.subValue}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" />
            Orders by Status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {ordersLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Order Count</TableHead>
                  <TableHead className="text-right">Total Revenue</TableHead>
                  <TableHead className="text-right hidden md:table-cell">Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statusBreakdown.map(({ status, count, revenue }) => {
                  const total = orders?.length ?? 1;
                  const share = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <TableRow key={status} className="hover:bg-muted/40 transition-colors">
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs capitalize ${STATUS_COLORS[status] ?? 'bg-muted text-muted-foreground'}`}
                        >
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{count}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{revenue.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell className="text-right hidden md:table-cell text-muted-foreground text-sm">
                        {share}%
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminReportsPage() {
  return (
    <AdminLayout>
      <ReportsContent />
    </AdminLayout>
  );
}
