import { Shirt, LogOut, LogIn, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface BrandHeaderProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

export default function BrandHeader({ isAuthenticated, onLogout }: BrandHeaderProps) {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-xs">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Shirt className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-foreground">
            Press<span className="text-primary">Wala</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isInitializing ? (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          ) : isAuthenticated ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-muted-foreground hover:text-foreground gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={login}
              disabled={isLoggingIn}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
