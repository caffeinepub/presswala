import { useState } from 'react';
import { useGetAllOrders, useCancelOrder } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import StatusBadge from './StatusBadge';
import ReassignOrderModal from './ReassignOrderModal';
import { formatCurrency, formatDate, formatItemBreakdown } from '../lib/appUtils';
import { OrderStatus, type Order } from '../backend';
import { toast } from 'sonner';
import { Loader2, RefreshCw, XCircle } from 'lucide-react';

const STATUS_TABS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: OrderStatus.pending },
  { label: 'Accepted', value: OrderStatus.accepted },
  { label: 'Picked Up', value: OrderStatus.pickedUp },
  { label: 'Ironing', value: OrderStatus.ironing },
  { label: 'Delivered', value: OrderStatus.delivered },
  { label: 'Cancelled', value: OrderStatus.cancelled },
];

export default function AdminOrdersTable() {
  const { data: allOrders, isLoading } = useGetAllOrders();
  const cancelOrder = useCancelOrder();
  const [activeTab, setActiveTab] = useState('all');
  const [reassignOrderId, setReassignOrderId] = useState<bigint | null>(null);
  const [cancellingId, setCancellingId] = useState<bigint | null>(null);

  const filteredOrders = allOrders
    ? activeTab === 'all'
      ? allOrders
      : allOrders.filter((o) => o.status === activeTab)
    : [];

  const sortedOrders = [...filteredOrders].sort((a, b) => Number(b.createdAt) - Number(a.createdAt));

  const handleCancel = async (orderId: bigint) => {
    setCancellingId(orderId);
    try {
      await cancelOrder.mutateAsync(orderId);
      toast.success(`Order #${orderId} cancelled.`);
    } catch {
      toast.error('Failed to cancel order.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">Orders</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {allOrders?.length ?? 0} total orders
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto pb-1 mb-4">
          <TabsList className="inline-flex w-auto gap-1">
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="text-xs whitespace-nowrap">
                {tab.label}
                {allOrders && tab.value !== 'all' && (
                  <span className="ml-1 text-muted-foreground">
                    ({allOrders.filter((o) => o.status === tab.value).length})
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {STATUS_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
              </div>
            ) : sortedOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="font-medium">No orders found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedOrders.map((order: Order) => (
                  <div key={order.id.toString()} className="bg-card rounded-xl p-4 shadow-card border border-border">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-bold text-sm">Order #{order.id.toString()}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{order.address}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{formatItemBreakdown(order)}</span>
                        <span className="font-bold text-primary">{formatCurrency(order.totalAmount)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {order.status !== OrderStatus.cancelled && order.status !== OrderStatus.delivered && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1"
                              onClick={() => setReassignOrderId(order.id)}
                            >
                              <RefreshCw className="w-3 h-3" />
                              Reassign
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-7 text-xs gap-1"
                              onClick={() => handleCancel(order.id)}
                              disabled={cancellingId === order.id}
                            >
                              {cancellingId === order.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {reassignOrderId !== null && (
        <ReassignOrderModal
          open={true}
          onClose={() => setReassignOrderId(null)}
          orderId={reassignOrderId}
        />
      )}
    </div>
  );
}
