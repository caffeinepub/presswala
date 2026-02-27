import { useNavigate } from '@tanstack/react-router';
import { useGetUserOrders } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Principal } from '@dfinity/principal';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import StatusBadge from './StatusBadge';
import { formatCurrency, formatDate, formatItemBreakdown } from '../lib/appUtils';
import { Package, PlusCircle, ChevronRight, Shirt, Banknote, CreditCard } from 'lucide-react';
import { type Order } from '../backend';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const userId = identity ? identity.getPrincipal() : null;
  const { data: orders, isLoading } = useGetUserOrders(userId as Principal | null);

  const sortedOrders = orders
    ? [...orders].sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
    : [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-extrabold text-foreground">My Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track your ironing orders</p>
        </div>
        <Button
          size="sm"
          onClick={() => navigate({ to: '/customer/place-order' })}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 font-semibold"
        >
          <PlusCircle className="w-4 h-4" />
          New Order
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : sortedOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
            <Shirt className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-bold text-foreground mb-1">No orders yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Place your first ironing order!</p>
          <Button
            onClick={() => navigate({ to: '/customer/place-order' })}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Place Order
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedOrders.map((order: Order) => (
            <button
              type="button"
              key={order.id.toString()}
              onClick={() => navigate({ to: `/customer/orders/${order.id.toString()}` })}
              className="w-full bg-card rounded-xl p-4 shadow-card border border-border hover:shadow-card-md hover:border-primary/30 transition-all text-left group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">Order #{order.id.toString()}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{order.address}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={order.status} />
                  {order.paymentMethod === 'cash' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                      <Banknote className="w-3 h-3" />
                      Cash
                    </span>
                  ) : order.paymentMethod === 'online' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                      <CreditCard className="w-3 h-3" />
                      Online
                    </span>
                  ) : null}
                  <span className="text-xs text-muted-foreground hidden sm:inline">{formatItemBreakdown(order)}</span>
                </div>
                <span className="font-bold text-sm text-primary">{formatCurrency(order.totalAmount)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{formatDate(order.createdAt)}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
