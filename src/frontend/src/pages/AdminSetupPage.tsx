import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useWhoAmI, useClaimAdminIfFirst } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { Loader2, ShieldCheck, Copy, CheckCircle2, AlertCircle, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminSetupPage() {
  const navigate = useNavigate();
  const { data: principal, isLoading: principalLoading } = useWhoAmI();
  const { actor, isFetching: actorFetching } = useActor();
  const claimMutation = useClaimAdminIfFirst();
  const [claimResult, setClaimResult] = useState<'success' | 'already_claimed' | 'error' | null>(null);
  const [claimError, setClaimError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const actorReady = !!actor && !actorFetching;

  const handleCopy = () => {
    if (principal) {
      navigator.clipboard.writeText(principal);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClaim = async () => {
    setClaimResult(null);
    setClaimError('');
    try {
      const result = await claimMutation.mutateAsync();
      if (result) {
        setClaimResult('success');
        // Auto-redirect to admin panel after 2 seconds
        setTimeout(() => {
          navigate({ to: '/admin' });
        }, 2000);
      } else {
        setClaimResult('already_claimed');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // If the backend traps because claimAdminIfFirst doesn't exist, show a helpful message
      if (msg.includes('not supported') || msg.includes('has no query') || msg.includes('has no update')) {
        setClaimResult('error');
        setClaimError('claimAdminIfFirst is not available on this backend. Please redeploy with the latest backend code.');
      } else {
        setClaimResult('error');
        setClaimError(msg);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background flex items-start justify-center pt-12 px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Terminal className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Setup</h1>
            <p className="text-sm text-muted-foreground">Diagnostic & first-time admin bootstrap</p>
          </div>
        </div>

        {/* Your Principal Card */}
        <div className="rounded-xl border border-border bg-card p-5 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Your Current Principal
          </p>
          {principalLoading || !actorReady ? (
            <Skeleton className="h-5 w-full rounded" />
          ) : principal ? (
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono text-foreground break-all flex-1">{principal}</code>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 p-1.5 rounded-md hover:bg-accent transition-colors"
                title="Copy principal"
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Could not fetch principal</p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            This is the principal your current session is using. If you're logged in via Internet Identity, this is your II principal.
          </p>
        </div>

        {/* Claim Admin Card */}
        <div className="rounded-xl border border-border bg-card p-5 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            First-Time Admin Bootstrap
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            If no admin has been registered yet, clicking the button below will claim admin access for your current principal. This is a one-time operation — it will do nothing if an admin already exists.
          </p>

          <Button
            onClick={handleClaim}
            disabled={claimMutation.isPending || !actorReady}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
          >
            {claimMutation.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Claiming...</>
            ) : (
              <><ShieldCheck className="w-4 h-4 mr-2" />Claim Admin (First Time)</>
            )}
          </Button>

          {/* Result messages */}
          {claimResult === 'success' && (
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-3">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-800 dark:text-green-300">Admin access granted! Redirecting to admin panel...</p>
                <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">
                  Your principal has been added as an admin. You will be redirected in 2 seconds.
                </p>
              </div>
            </div>
          )}

          {claimResult === 'already_claimed' && (
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Admin already exists</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                  An admin is already registered. This operation is a no-op. If you are the admin, try logging in with the correct Internet Identity.
                </p>
              </div>
            </div>
          )}

          {claimResult === 'error' && (
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800 dark:text-red-300">Error</p>
                <p className="text-xs text-red-700 dark:text-red-400 mt-0.5 font-mono break-all">{claimError}</p>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="rounded-xl border border-border bg-card p-5 mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            How to fix "Access Denied"
          </p>
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
            <li>Make sure you are logged in with Internet Identity (passkey) — not a PIN or anonymous session.</li>
            <li>Copy your principal shown above.</li>
            <li>If no admin exists yet, click "Claim Admin (First Time)" above.</li>
            <li>If an admin already exists, ask the existing admin to add your principal via the backend.</li>
            <li>After claiming, navigate to the <button type="button" onClick={() => navigate({ to: '/admin' })} className="text-primary underline font-medium">Admin Panel</button>.</li>
          </ol>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/' })}
            className="flex-1"
          >
            ← Go to Home
          </Button>
          {claimResult === 'success' && (
            <Button
              onClick={() => navigate({ to: '/admin' })}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
            >
              Go to Admin Panel →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
