import AdminLayout from '../components/AdminLayout';
import { useWhoAmI } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, ExternalLink, Info, Copy, CheckCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

function SettingsContent() {
  const { data: principal, isLoading } = useWhoAmI();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!principal) return;
    await navigator.clipboard.writeText(principal);
    setCopied(true);
    toast.success('Principal copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Platform configuration and admin info</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Admin Identity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Your Internet Identity Principal</p>
            {isLoading ? (
              <Skeleton className="h-10 rounded-lg" />
            ) : (
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono bg-muted/60 border border-border px-3 py-2 rounded-lg break-all text-foreground">
                  {principal ?? '—'}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 shrink-0 gap-1.5"
                  onClick={handleCopy}
                  disabled={!principal}
                >
                  {copied ? (
                    <><CheckCheck className="w-3.5 h-3.5 text-emerald-600" />Copied</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" />Copy</>
                  )}
                </Button>
              </div>
            )}
          </div>
          <Separator />
          <div>
            <p className="text-xs text-muted-foreground mb-2">Admin Access Management</p>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
              onClick={() => navigate({ to: '/admin/setup' })}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Go to Admin Setup
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            Platform Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {[
              { label: 'Platform', value: 'PressWala' },
              { label: 'Description', value: 'Cloth ironing pickup & delivery marketplace' },
              { label: 'Network', value: 'Internet Computer (ICP)' },
              { label: 'Version', value: '1.0.0' },
            ].map((row) => (
              <div key={row.label} className="flex items-start gap-3">
                <span className="text-muted-foreground w-28 shrink-0">{row.label}</span>
                <span className="text-foreground font-medium">{row.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Orders', path: '/admin/orders' },
              { label: 'Shops', path: '/admin/shops' },
              { label: 'Customers', path: '/admin/customers' },
              { label: 'Pricing', path: '/admin/pricing' },
              { label: 'Areas', path: '/admin/areas' },
              { label: 'Reports', path: '/admin/reports' },
            ].map((item) => (
              <Button
                key={item.path}
                variant="outline"
                size="sm"
                className="justify-start text-sm"
                onClick={() => navigate({ to: item.path })}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <AdminLayout>
      <SettingsContent />
    </AdminLayout>
  );
}
