import { useGetAllUsers } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '../lib/appUtils';
import { Users, TrendingUp, Package } from 'lucide-react';

export default function AdminUsersTable() {
  const { data: users, isLoading } = useGetAllUsers();

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">Users</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {users?.length ?? 0} registered users
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : !users || users.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold text-foreground">No users yet</p>
          <p className="text-sm text-muted-foreground mt-1">Users will appear here after registration</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div key={`${user.name}-${user.phone}`} className="bg-card rounded-xl p-4 shadow-card border border-border">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="font-bold text-sm text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.phone}</p>
                </div>
                <div className="flex items-center gap-1 bg-accent px-2 py-0.5 rounded-full">
                  <span className="text-xs font-semibold text-accent-foreground">User</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-muted rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Package className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-bold text-foreground">{user.completedOrders.toString()}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div className="bg-muted rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <TrendingUp className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-bold text-foreground">{formatCurrency(user.totalEarnings)}</p>
                  <p className="text-xs text-muted-foreground">Earnings</p>
                </div>
                <div className="bg-muted rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <TrendingUp className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-bold text-foreground">{formatCurrency(user.balance)}</p>
                  <p className="text-xs text-muted-foreground">Balance</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
