import { useGetAdminStats } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { IndianRupee, ShoppingBag, Users, Store, Clock, Zap, AlertCircle } from 'lucide-react';

function formatRupees(amount: bigint): string {
  return '₹' + Number(amount).toLocaleString('en-IN');
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminStats();

  const statCards = stats
    ? [
        {
          label: 'Total Earnings',
          value: formatRupees(stats.totalEarnings),
          icon: IndianRupee,
          color: 'bg-primary/10 text-primary',
          highlight: true,
        },
        {
          label: 'Orders Today',
          value: Number(stats.totalOrdersToday).toString(),
          icon: ShoppingBag,
          color: 'bg-blue-100 text-blue-700',
        },
        {
          label: 'Total Customers',
          value: Number(stats.totalCustomers).toString(),
          icon: Users,
          color: 'bg-violet-100 text-violet-700',
        },
        {
          label: 'Total Shops',
          value: Number(stats.totalShops).toString(),
          icon: Store,
          color: 'bg-emerald-100 text-emerald-700',
        },
        {
          label: 'Pending Approvals',
          value: Number(stats.pendingShopApprovals).toString(),
          icon: AlertCircle,
          color: 'bg-amber-100 text-amber-700',
        },
        {
          label: 'Active Orders',
          value: Number(stats.activeOrders).toString(),
          icon: Zap,
          color: 'bg-orange-100 text-orange-700',
        },
      ]
    : [];

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Platform overview</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className={`h-28 rounded-xl ${i === 1 ? 'col-span-2 md:col-span-3' : ''}`} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className={`bg-card rounded-xl p-5 shadow-sm border border-border ${stat.highlight ? 'col-span-2 md:col-span-3' : ''}`}
            >
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className={`font-extrabold ${stat.highlight ? 'text-3xl' : 'text-2xl'} text-foreground`}>
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {!isLoading && stats && Number(stats.pendingShopApprovals) > 0 && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {Number(stats.pendingShopApprovals)} shop{Number(stats.pendingShopApprovals) !== 1 ? 's' : ''} awaiting approval
            </p>
            <p className="text-xs text-amber-600 mt-0.5">Review pending shop registrations in the Shops section</p>
          </div>
        </div>
      )}
    </div>
  );
}
