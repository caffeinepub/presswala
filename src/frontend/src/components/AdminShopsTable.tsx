import { useGetAllShops, useApproveShop, useRejectShop, useSuspendShop } from '../hooks/useQueries';
import { ShopStatus, type Shop } from '../backend';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Store, CheckCircle2, XCircle, PauseCircle, Loader2 } from 'lucide-react';

function ShopStatusBadge({ status }: { status: ShopStatus }) {
  const map: Record<ShopStatus, { label: string; className: string }> = {
    [ShopStatus.pending]: { label: 'Pending', className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400' },
    [ShopStatus.active]: { label: 'Active', className: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400' },
    [ShopStatus.rejected]: { label: 'Rejected', className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400' },
    [ShopStatus.suspended]: { label: 'Suspended', className: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400' },
  };
  const { label, className } = map[status] ?? map[ShopStatus.pending];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${className}`}>
      {label}
    </span>
  );
}

function ShopRow({ shop }: { shop: Shop }) {
  const approveShop = useApproveShop();
  const rejectShop = useRejectShop();
  const suspendShop = useSuspendShop();

  const handleApprove = async () => {
    try {
      await approveShop.mutateAsync(shop.id);
      toast.success(`${shop.shopName} approved successfully!`);
    } catch {
      toast.error('Failed to approve shop.');
    }
  };

  const handleReject = async () => {
    try {
      await rejectShop.mutateAsync(shop.id);
      toast.success(`${shop.shopName} rejected.`);
    } catch {
      toast.error('Failed to reject shop.');
    }
  };

  const handleSuspend = async () => {
    try {
      await suspendShop.mutateAsync(shop.id);
      toast.success(`${shop.shopName} suspended.`);
    } catch {
      toast.error('Failed to suspend shop.');
    }
  };

  const isBusy = approveShop.isPending || rejectShop.isPending || suspendShop.isPending;

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Store className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">{shop.shopName}</p>
            <p className="text-xs text-muted-foreground">{shop.mobile}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-sm text-foreground">{shop.ownerName}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{shop.address.split(',').slice(-2).join(',').trim()}</TableCell>
      <TableCell className="text-sm font-medium text-foreground">₹{shop.pricePerCloth.toString()}</TableCell>
      <TableCell><ShopStatusBadge status={shop.status} /></TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {shop.status === ShopStatus.pending && (
            <>
              <Button
                size="sm"
                onClick={handleApprove}
                disabled={isBusy}
                className="gap-1.5 h-7 text-xs"
              >
                {approveShop.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleReject}
                disabled={isBusy}
                className="gap-1.5 h-7 text-xs"
              >
                {rejectShop.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                Reject
              </Button>
            </>
          )}
          {shop.status === ShopStatus.active && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleSuspend}
              disabled={isBusy}
              className="gap-1.5 h-7 text-xs"
            >
              {suspendShop.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <PauseCircle className="w-3 h-3" />}
              Suspend
            </Button>
          )}
          {(shop.status === ShopStatus.rejected || shop.status === ShopStatus.suspended) && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleApprove}
              disabled={isBusy}
              className="gap-1.5 h-7 text-xs"
            >
              {approveShop.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
              Re-approve
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function AdminShopsTable() {
  const { data: shops, isLoading, error } = useGetAllShops();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">Failed to load shops. Please refresh.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Shop Registrations</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {shops?.length ?? 0} shop{shops?.length !== 1 ? 's' : ''} registered
          </p>
        </div>
      </div>

      {!shops || shops.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <Store className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold text-foreground">No shops registered yet</p>
          <p className="text-sm text-muted-foreground mt-1">Shop registrations will appear here.</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-bold text-xs uppercase tracking-wide">Shop</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Owner</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Area</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Price</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Status</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shops.map((shop) => (
                <ShopRow key={shop.id.toString()} shop={shop} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
