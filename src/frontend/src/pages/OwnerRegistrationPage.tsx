import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Loader2 } from 'lucide-react';
import OwnerRegistrationForm from '../components/OwnerRegistrationForm';

export default function OwnerRegistrationPage() {
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();

  useEffect(() => {
    if (!isInitializing && !identity) {
      navigate({ to: '/' });
    }
  }, [identity, isInitializing, navigate]);

  if (isInitializing || !identity) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-2">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-extrabold text-foreground">Register Your Shop</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Join PressWala as a shop owner and start receiving orders
          </p>
        </div>
      </div>
      <OwnerRegistrationForm />
    </div>
  );
}
