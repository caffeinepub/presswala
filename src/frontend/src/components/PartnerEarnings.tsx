import { useGetPartnerOrders } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatItemBreakdown } from '../lib/appUtils';
import { OrderStatus } from '../backend';
import { TrendingUp, Package, IndianRupee, Star } from 'lucide-react';

export default function PartnerEarnings() {
  const { data: orders, isLoading } = useGetPartnerOrders();

  const deliveredOrders = orders?.filter((o) => o.status === OrderStatus.delivered) ?? [];
  const totalEarnings = deliveredOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const totalOrders = deliveredOrders.length;
  const avgPerOrder = totalOrders > 0 ? Math.round(totalEarnings / totalOrders) : 0;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 animate-fade-in">
      <div className="mb-5">
        <h1 className="text-xl font-extrabold text-foreground">My Earnings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your delivery performance summary</p>
      </div>

      {/* Hero Earnings Card */}
      <div className="bg-primary rounded-2xl p-6 mb-5 text-primary-foreground shadow-card-md">
        <div className="flex items-center gap-2 mb-1">
          <IndianRupee className="w-5 h-5 opacity-80" />
          <span className="text-sm font-medium opacity-80">Total Earnings</span>
        </div>
        <p className="text-4xl font-extrabold">{formatCurrency(totalEarnings)}</p>
        <p className="text-sm opacity-70 mt-1">From {totalOrders} completed orders</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-card rounded-xl p-4 shadow-card border border-border">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center mb-3">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-extrabold text-foreground">{totalOrders}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Orders Delivered</p>
        </div>

        <div className="bg-card rounded-xl p-4 shadow-card border border-border">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-extrabold text-foreground">{formatCurrency(avgPerOrder)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Avg per Order</p>
        </div>
      </div>

      {/* Recent Deliveries */}
      {deliveredOrders.length > 0 && (
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Recent Deliveries</p>
          <div className="space-y-2">
            {[...deliveredOrders].reverse().slice(0, 5).map((order) => (
              <div key={order.id.toString()} className="bg-card rounded-xl p-3 shadow-card border border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                    <Star className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Order #{order.id.toString()}</p>
                    <p className="text-xs text-muted-foreground">{formatItemBreakdown(order)}</p>
                  </div>
                </div>
                <span className="font-bold text-sm text-primary">{formatCurrency(order.totalAmount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {deliveredOrders.length === 0 && (
        <div className="text-center py-10">
          <TrendingUp className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold text-foreground">No earnings yet</p>
          <p className="text-sm text-muted-foreground mt-1">Complete deliveries to earn money</p>
        </div>
      )}
    </div>
  );
}
