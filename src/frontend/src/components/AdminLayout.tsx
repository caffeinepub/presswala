import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin, useWhoAmI } from '../hooks/useQueries';
import AdminSidebar from './AdminSidebar';
import { Loader2, ShieldX, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const { identity, login, isLoggingIn, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: isAdmin, isLoading, isFetched } = useIsCallerAdmin();
  const { data: principal, isLoading: principalLoading } = useWhoAmI();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setTimedOut(false);
      return;
    }
    const timer = setTimeout(() => setTimedOut(true), 6000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm px-6">
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Admin Access Required</h2>
          <p className="text-sm text-muted-foreground mt-2 mb-6">
            Admin access requires Internet Identity (passkey) authentication.
          </p>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
          >
            {isLoggingIn ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Connecting...</>
            ) : (
              'Log in with Internet Identity'
            )}
          </Button>
          <button type="button" onClick={() => navigate({ to: '/' })} className="text-primary font-medium mt-4 text-sm block mx-auto">
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  if (isLoading && !timedOut) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (isAdmin === true) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <AdminSidebar />
        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-sm px-6">
        <ShieldX className="w-12 h-12 text-destructive mx-auto mb-3" />
        <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
          {timedOut && !isFetched
            ? 'Could not verify admin status. Please try again.'
            : 'Admin access requires Internet Identity (passkey) authentication.'}
        </p>
        <div className="mt-4 rounded-lg bg-muted/50 border border-border px-4 py-3 text-left">
          <p className="text-xs font-semibold text-muted-foreground mb-1">Your principal:</p>
          {principalLoading ? (
            <Skeleton className="h-4 w-full rounded" />
          ) : (
            <code className="text-xs font-mono text-foreground break-all">{principal ?? '—'}</code>
          )}
        </div>
        <div className="flex flex-col gap-2 mt-4 items-center">
          {timedOut && !isFetched && (
            <Button onClick={() => window.location.reload()} variant="outline" className="text-sm w-full">
              Retry
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/admin/setup' })}
            className="text-sm w-full border-primary/40 text-primary hover:bg-primary/5"
          >
            First time? Claim admin access here
          </Button>
          <button type="button" onClick={() => navigate({ to: '/' })} className="text-primary font-medium text-sm">
            ← Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}
