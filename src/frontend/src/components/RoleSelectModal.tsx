import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ShoppingBag, Bike, Store, ShieldCheck, Loader2 } from 'lucide-react';
import { type AppRole, setStoredAppRole } from '../lib/roleStorage';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useState } from 'react';

interface RoleSelectModalProps {
  open: boolean;
  onSelect: (role: AppRole) => void;
}

export default function RoleSelectModal({ open, onSelect }: RoleSelectModalProps) {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [adminLoggingIn, setAdminLoggingIn] = useState(false);

  const handleSelect = async (role: AppRole) => {
    if (role === 'admin') {
      // Admin role requires Internet Identity (passkey) authentication
      if (!isAuthenticated) {
        setAdminLoggingIn(true);
        try {
          await login();
          // After successful II login, proceed with admin role
          setStoredAppRole(role);
          onSelect(role);
        } catch {
          // Login cancelled or failed — do not grant admin access
        } finally {
          setAdminLoggingIn(false);
        }
      } else {
        // Already authenticated via II — proceed directly
        setStoredAppRole(role);
        onSelect(role);
      }
      return;
    }
    setStoredAppRole(role);
    onSelect(role);
  };

  const roles: { role: AppRole; icon: React.ElementType; label: string; desc: string }[] = [
    { role: 'customer', icon: ShoppingBag, label: 'Customer', desc: 'Place & track orders' },
    { role: 'partner', icon: Bike, label: 'Partner', desc: 'Deliver & earn' },
    { role: 'owner', icon: Store, label: 'Shop Owner', desc: 'Manage your shop' },
    { role: 'admin', icon: ShieldCheck, label: 'Admin', desc: 'Manage platform' },
  ];

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-sm mx-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">How do you use PressWala?</DialogTitle>
          <DialogDescription>
            Choose your role to get the right experience.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 mt-2">
          {roles.map(({ role, icon: Icon, label, desc }) => {
            const isAdminOption = role === 'admin';
            const isDisabled = isLoggingIn || adminLoggingIn;
            return (
              <button
                type="button"
                key={role}
                onClick={() => handleSelect(role)}
                disabled={isDisabled}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center
                  ${isAdminOption
                    ? 'border-primary/30 bg-primary/5 hover:border-primary hover:bg-primary/10'
                    : 'border-border bg-card hover:border-primary hover:bg-accent'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                  ${isAdminOption ? 'bg-primary/10' : 'bg-accent'}`}>
                  {isAdminOption && adminLoggingIn ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : (
                    <Icon className={`w-5 h-5 ${isAdminOption ? 'text-primary' : 'text-primary'}`} />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                  {isAdminOption && (
                    <p className="text-xs text-primary/70 mt-0.5 font-medium">Passkey required</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
