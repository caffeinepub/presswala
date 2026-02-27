import { useNavigate } from '@tanstack/react-router';
import { useGetMyShop } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ShopStatus } from '../backend';
import {
  Store,
  MapPin,
  Clock,
  IndianRupee,
  Phone,
  CheckCircle2,
  AlertCircle,
  Hourglass,
  PauseCircle,
  PlusCircle,
} from 'lucide-react';

function StatusSection({ status }: { status: ShopStatus }) {
  if (status === ShopStatus.pending) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mx-auto">
          <Hourglass className="w-7 h-7 text-amber-600 dark:text-amber-400" />
        </div>
        <h3 className="text-lg font-bold text-amber-800 dark:text-amber-300">Verification in Progress</h3>
        <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
          Your shop is under review by our admin team. This usually takes 24–48 hours.
          You'll be notified once your shop is approved.
        </p>
        <div className="flex flex-col gap-1.5 text-xs text-amber-600 dark:text-amber-500 mt-2">
          <span>📋 Admin is reviewing your details</span>
          <span>📞 We may contact you for verification</span>
        </div>
      </div>
    );
  }

  if (status === ShopStatus.rejected) {
    return (
      <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-6 text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7 text-destructive" />
        </div>
        <h3 className="text-lg font-bold text-destructive">Registration Rejected</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Unfortunately your shop registration was not approved. Please update your details and resubmit.
        </p>
      </div>
    );
  }

  if (status === ShopStatus.suspended) {
    return (
      <div className="bg-muted border border-border rounded-2xl p-6 text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto">
          <PauseCircle className="w-7 h-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Shop Suspended</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your shop has been temporarily suspended. Please contact support for more information.
        </p>
      </div>
    );
  }

  return null;
}

function StatusBadgeShop({ status }: { status: ShopStatus }) {
  const map: Record<ShopStatus, { label: string; className: string }> = {
    [ShopStatus.pending]: { label: 'Pending', className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400' },
    [ShopStatus.active]: { label: 'Active', className: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400' },
    [ShopStatus.rejected]: { label: 'Rejected', className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400' },
    [ShopStatus.suspended]: { label: 'Suspended', className: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400' },
  };
  const { label, className } = map[status] ?? map[ShopStatus.pending];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${className}`}>
      {label}
    </span>
  );
}

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { data: shop, isLoading, error } = useGetMyShop();

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 text-center">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Failed to load shop data. Please try again.</p>
      </div>
    );
  }

  // No shop registered yet
  if (!shop) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Store className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">No Shop Registered</h2>
        <p className="text-sm text-muted-foreground">
          You haven't registered a shop yet. Register now to start receiving orders.
        </p>
        <Button onClick={() => navigate({ to: '/owner/register' })} className="gap-2">
          <PlusCircle className="w-4 h-4" /> Register Your Shop
        </Button>
      </div>
    );
  }

  const isActive = shop.status === ShopStatus.active;
  const isRejected = shop.status === ShopStatus.rejected;

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-5">
      {/* Header card */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Store className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-foreground leading-tight">{shop.shopName}</h2>
              <p className="text-sm text-muted-foreground">{shop.ownerName}</p>
            </div>
          </div>
          <StatusBadgeShop status={shop.status} />
        </div>

        {isActive && (
          <div className="mt-4 flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
            <p className="text-sm font-semibold text-green-700 dark:text-green-400">
              🎉 Congratulations! Your shop is live and accepting orders.
            </p>
          </div>
        )}
      </div>

      {/* Status-specific message */}
      {!isActive && <StatusSection status={shop.status} />}

      {/* Shop details (always shown) */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-card space-y-3">
        <h3 className="font-bold text-sm text-foreground uppercase tracking-wide">Shop Information</h3>
        <div className="space-y-2.5">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Address</p>
              <p className="text-sm font-medium text-foreground">{shop.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Mobile</p>
              <p className="text-sm font-medium text-foreground">{shop.mobile}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <IndianRupee className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Price per cloth</p>
              <p className="text-sm font-medium text-foreground">₹{shop.pricePerCloth.toString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Service area</p>
              <p className="text-sm font-medium text-foreground">{shop.serviceArea.toString()} km radius</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Working hours</p>
              <p className="text-sm font-medium text-foreground">{shop.workingHours}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resubmit button for rejected */}
      {isRejected && (
        <Button
          variant="outline"
          onClick={() => navigate({ to: '/owner/register' })}
          className="w-full gap-2"
        >
          <PlusCircle className="w-4 h-4" /> Update Details & Resubmit
        </Button>
      )}
    </div>
  );
}
