import { useState } from 'react';
import { useGetPendingOrders, useGetPartnerOrders } from '../hooks/useQueries';
import PartnerOrderCard from './PartnerOrderCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Package, CheckCircle } from 'lucide-react';

export default function PartnerDashboard() {
  const { data: pendingOrders, isLoading: loadingPending } = useGetPendingOrders();
  const { data: myOrders, isLoading: loadingMine } = useGetPartnerOrders();

  const activeOrders = myOrders?.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  ) ?? [];
  const completedOrders = myOrders?.filter(
    (o) => o.status === 'delivered' || o.status === 'cancelled'
  ) ?? [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 animate-fade-in">
      <div className="mb-5">
        <h1 className="text-xl font-extrabold text-foreground">Partner Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your ironing orders</p>
      </div>

      <Tabs defaultValue="available">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="available" className="flex-1 gap-1.5">
            <Package className="w-4 h-4" />
            Available
            {pendingOrders && pendingOrders.length > 0 && (
              <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {pendingOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="mine" className="flex-1 gap-1.5">
            <CheckCircle className="w-4 h-4" />
            My Orders
            {activeOrders.length > 0 && (
              <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {activeOrders.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          {loadingPending ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <Skeleton key={i} className="h-36 w-full rounded-xl" />)}
            </div>
          ) : !pendingOrders || pendingOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold text-foreground">No available orders</p>
              <p className="text-sm text-muted-foreground mt-1">Check back soon for new orders</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingOrders.map((order) => (
                <PartnerOrderCard key={order.id.toString()} order={order} mode="available" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mine">
          {loadingMine ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <Skeleton key={i} className="h-36 w-full rounded-xl" />)}
            </div>
          ) : activeOrders.length === 0 && completedOrders.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold text-foreground">No orders yet</p>
              <p className="text-sm text-muted-foreground mt-1">Accept orders from the Available tab</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeOrders.length > 0 && (
                <>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Active</p>
                  {activeOrders.map((order) => (
                    <PartnerOrderCard key={order.id.toString()} order={order} mode="mine" />
                  ))}
                </>
              )}
              {completedOrders.length > 0 && (
                <>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mt-4">Completed</p>
                  {completedOrders.map((order) => (
                    <PartnerOrderCard key={order.id.toString()} order={order} mode="mine" />
                  ))}
                </>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
