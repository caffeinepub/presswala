import { useState } from 'react';
import { type Order, OrderStatus } from '../backend';
import StatusBadge from './StatusBadge';
import { Button } from '@/components/ui/button';
import { useAcceptOrder, useUpdateOrderStatus } from '../hooks/useQueries';
import { formatCurrency, formatDate, getNextStatus, getNextStatusLabel, formatItemBreakdown } from '../lib/appUtils';
import { toast } from 'sonner';
import { Loader2, MapPin, Shirt, IndianRupee } from 'lucide-react';

interface PartnerOrderCardProps {
  order: Order;
  mode: 'available' | 'mine';
}

export default function PartnerOrderCard({ order, mode }: PartnerOrderCardProps) {
  const acceptOrder = useAcceptOrder();
  const updateStatus = useUpdateOrderStatus();
  const [loadingAction, setLoadingAction] = useState(false);

  const handleAccept = async () => {
    setLoadingAction(true);
    try {
      await acceptOrder.mutateAsync(order.id);
      toast.success(`Order #${order.id} accepted!`);
    } catch (err) {
      toast.error('Failed to accept order.');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleStatusUpdate = async () => {
    const nextStatus = getNextStatus(order.status);
    if (!nextStatus) return;
    setLoadingAction(true);
    try {
      await updateStatus.mutateAsync({ orderId: order.id, newStatus: nextStatus });
      toast.success(`Order #${order.id} updated to ${nextStatus}!`);
    } catch (err) {
      toast.error('Failed to update status.');
    } finally {
      setLoadingAction(false);
    }
  };

  const nextStatusLabel = getNextStatusLabel(order.status);

  return (
    <div className="bg-card rounded-xl p-4 shadow-card border border-border">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="font-bold text-sm text-foreground">Order #{order.id.toString()}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-start gap-2">
          <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-foreground line-clamp-2">{order.address}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Shirt className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{formatItemBreakdown(order)}</span>
          </div>
          <div className="flex items-center gap-1">
            <IndianRupee className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-primary">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {mode === 'available' && (
        <Button
          size="sm"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
          onClick={handleAccept}
          disabled={loadingAction}
        >
          {loadingAction ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
          Accept Order
        </Button>
      )}

      {mode === 'mine' && nextStatusLabel && (
        <Button
          size="sm"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
          onClick={handleStatusUpdate}
          disabled={loadingAction}
        >
          {loadingAction ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
          {nextStatusLabel}
        </Button>
      )}

      {mode === 'mine' && !nextStatusLabel && (
        <div className="text-center py-1">
          <span className="text-xs text-muted-foreground font-medium">
            {order.status === OrderStatus.delivered ? '✅ Delivered' : '❌ Cancelled'}
          </span>
        </div>
      )}
    </div>
  );
}
