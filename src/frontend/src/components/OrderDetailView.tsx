import { useNavigate } from '@tanstack/react-router';
import { useGetOrder } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import StatusBadge from './StatusBadge';
import { formatCurrency, formatDate, formatItemBreakdown } from '../lib/appUtils';
import { ArrowLeft, MapPin, Shirt, Clock, IndianRupee, User, Banknote, CreditCard } from 'lucide-react';

interface OrderDetailViewProps {
  orderId: bigint;
}

export default function OrderDetailView({ orderId }: OrderDetailViewProps) {
  const navigate = useNavigate();
  const { data: order, isLoading, error } = useGetOrder(orderId);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 text-center">
        <p className="text-muted-foreground">Order not found.</p>
        <button type="button" onClick={() => navigate({ to: '/customer' })} className="text-primary font-medium mt-2 text-sm">
          ← Back to orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate({ to: '/customer' })}
          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-foreground">Order #{order.id.toString()}</h1>
          <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-card rounded-xl p-5 shadow-card border border-border mb-4">
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-sm text-foreground">Current Status</span>
          <StatusBadge status={order.status} />
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-1">
          {(['pending', 'accepted', 'pickedUp', 'ironing', 'delivered'] as const).map((step, idx) => {
            const steps = ['pending', 'accepted', 'pickedUp', 'ironing', 'delivered'];
            const currentIdx = steps.indexOf(order.status as string);
            const stepIdx = steps.indexOf(step);
            const isDone = stepIdx <= currentIdx && order.status !== 'cancelled';
            const isCancelled = order.status === 'cancelled';

            return (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-3 h-3 rounded-full shrink-0 transition-colors ${
                    isCancelled
                      ? 'bg-destructive/30'
                      : isDone
                      ? 'bg-primary'
                      : 'bg-border'
                  }`}
                />
                {idx < 4 && (
                  <div
                    className={`flex-1 h-0.5 transition-colors ${
                      isCancelled
                        ? 'bg-destructive/20'
                        : stepIdx < currentIdx
                        ? 'bg-primary'
                        : 'bg-border'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-1">
          {['Placed', 'Accepted', 'Picked', 'Ironing', 'Done'].map((label) => (
            <span key={label} className="text-xs text-muted-foreground">{label}</span>
          ))}
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-card rounded-xl p-5 shadow-card border border-border space-y-4">
        <h2 className="font-bold text-sm text-foreground">Order Details</h2>

        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground font-medium">Pickup Address</p>
            <p className="text-sm text-foreground mt-0.5">{order.address}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Shirt className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground font-medium">Items</p>
            <p className="text-sm text-foreground mt-0.5">{formatItemBreakdown(order)}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
              {Number(order.shirts) > 0 && (
                <span className="text-xs text-muted-foreground">{Number(order.shirts)} Shirt{Number(order.shirts) !== 1 ? 's' : ''} × ₹12</span>
              )}
              {Number(order.pants) > 0 && (
                <span className="text-xs text-muted-foreground">{Number(order.pants)} Pant{Number(order.pants) !== 1 ? 's' : ''} × ₹12</span>
              )}
              {Number(order.dresses) > 0 && (
                <span className="text-xs text-muted-foreground">{Number(order.dresses)} Dress{Number(order.dresses) !== 1 ? 'es' : ''} × ₹15</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <IndianRupee className="w-4 h-4 text-primary shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground font-medium">Total Amount</p>
            <p className="text-sm font-bold text-primary mt-0.5">{formatCurrency(order.totalAmount)}</p>
          </div>
        </div>

        {order.paymentMethod && (
          <div className="flex items-center gap-3">
            {order.paymentMethod === 'cash' ? (
              <Banknote className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <CreditCard className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <div>
              <p className="text-xs text-muted-foreground font-medium">Payment Method</p>
              {order.paymentMethod === 'cash' ? (
                <span className="inline-flex items-center gap-1.5 mt-0.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                  <Banknote className="w-3 h-3" />
                  Cash on Delivery
                </span>
              ) : order.paymentMethod === 'online' ? (
                <span className="inline-flex items-center gap-1.5 mt-0.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                  <CreditCard className="w-3 h-3" />
                  Online Payment
                </span>
              ) : (
                <p className="text-sm text-foreground mt-0.5 capitalize">{order.paymentMethod}</p>
              )}
            </div>
          </div>
        )}

        {order.partnerId && (
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">Assigned Partner</p>
              <p className="text-xs text-foreground mt-0.5 font-mono">{order.partnerId.toString().slice(0, 20)}...</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-primary shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground font-medium">Last Updated</p>
            <p className="text-sm text-foreground mt-0.5">{formatDate(order.updatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
