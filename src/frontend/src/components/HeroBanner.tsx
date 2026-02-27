import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Shirt, Clock, Shield, ShieldCheck, Loader2 } from 'lucide-react';

export default function HeroBanner() {
  const { login, isLoggingIn, identity } = useInternetIdentity();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;

  const handleAdminClick = () => {
    if (isAuthenticated) {
      // Already authenticated via II — go directly to admin
      navigate({ to: '/admin' });
    } else {
      // Must authenticate via Internet Identity (passkey) for admin access
      // login() is synchronous (opens popup); navigation happens after II callback
      // The admin page itself will handle the post-login state
      login();
      // Navigate to /admin — the page will show the login prompt if not yet authenticated,
      // and will auto-show the dashboard once II login completes
      navigate({ to: '/admin' });
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Hero Image */}
      <div className="relative h-52 sm:h-64 overflow-hidden">
        <img
          src="/assets/generated/hero-banner.dim_1200x400.png"
          alt="PressWala - Fresh ironed clothes"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/20 to-foreground/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-lg">
            Welcome to <span className="text-primary">PressWala</span>
          </h1>
          <p className="text-white/90 text-sm sm:text-base mt-2 drop-shadow max-w-xs">
            Professional ironing, pickup & delivery at your doorstep
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: Shirt, label: 'From ₹12', sub: 'Per item' },
            { icon: Clock, label: 'Fast pickup', sub: 'Same day' },
            { icon: Shield, label: 'Trusted', sub: 'Verified partners' },
          ].map((feat) => (
            <div key={feat.label} className="bg-card rounded-xl p-3 shadow-card border border-border text-center">
              <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center mx-auto mb-2">
                <feat.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xs font-bold text-foreground">{feat.label}</p>
              <p className="text-xs text-muted-foreground">{feat.sub}</p>
            </div>
          ))}
        </div>

        <Button
          onClick={login}
          disabled={isLoggingIn}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-12 text-base shadow-card-md"
        >
          {isLoggingIn ? 'Connecting...' : 'Get Started — Login'}
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-3">
          Secure login powered by Internet Identity
        </p>

        {/* Admin entry point — always visible, triggers II login if not authenticated */}
        <div className="flex items-center justify-center mt-4">
          <button
            onClick={handleAdminClick}
            disabled={isLoggingIn}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
          >
            {isLoggingIn ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5" />
            )}
            <span>Admin Panel</span>
          </button>
        </div>
      </div>
    </div>
  );
}
