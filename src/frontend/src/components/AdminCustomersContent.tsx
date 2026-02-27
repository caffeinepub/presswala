import { useState } from 'react';
import { useGetAllRegisteredUsers, useBlockUser, useUnblockUser } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Users, Search, ShieldOff, ShieldCheck, Loader2 } from 'lucide-react';

export default function AdminCustomersContent() {
  const { data: users, isLoading } = useGetAllRegisteredUsers();
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();
  const [search, setSearch] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);

  const filtered = users
    ? users.filter(([principal, user]) => {
        const q = search.toLowerCase();
        return (
          user.name.toLowerCase().includes(q) ||
          user.phone.includes(q) ||
          principal.toString().toLowerCase().includes(q)
        );
      })
    : [];

  const handleBlock = async (principalStr: string, isBlocked: boolean) => {
    setActionId(principalStr);
    try {
      const { Principal } = await import('@dfinity/principal');
      const p = Principal.fromText(principalStr);
      if (isBlocked) {
        await unblockUser.mutateAsync(p);
        toast.success('User unblocked successfully');
      } else {
        await blockUser.mutateAsync(p);
        toast.success('User blocked successfully');
      }
    } catch {
      toast.error('Action failed. Please try again.');
    } finally {
      setActionId(null);
    }
  };

  const truncatePrincipal = (p: string) =>
    p.length > 20 ? `${p.slice(0, 10)}...${p.slice(-6)}` : p;

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {users?.length ?? 0} registered customers
          </p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, phone or principal..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-sm">
              {search ? 'No customers match your search' : 'No customers registered yet'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="hidden md:table-cell">Principal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(([principal, user]) => {
                const pStr = principal.toString();
                const isActionLoading = actionId === pStr;
                return (
                  <TableRow key={pStr} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-medium">{user.name || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{user.phone || '—'}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <code className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded">
                        {truncatePrincipal(pStr)}
                      </code>
                    </TableCell>
                    <TableCell>
                      {user.isBlocked ? (
                        <Badge variant="destructive" className="text-xs">Blocked</Badge>
                      ) : (
                        <Badge className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={user.isBlocked ? 'outline' : 'destructive'}
                        className={`h-7 text-xs gap-1 ${user.isBlocked ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50' : ''}`}
                        onClick={() => handleBlock(pStr, user.isBlocked)}
                        disabled={isActionLoading}
                      >
                        {isActionLoading ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : user.isBlocked ? (
                          <><ShieldCheck className="w-3 h-3" />Unblock</>
                        ) : (
                          <><ShieldOff className="w-3 h-3" />Block</>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
