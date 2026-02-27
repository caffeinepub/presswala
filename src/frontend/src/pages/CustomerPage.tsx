import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { getStoredAppRole } from '../lib/roleStorage';
import CustomerDashboard from '../components/CustomerDashboard';
import CustomerBottomNav from '../components/CustomerBottomNav';
import { Loader2 } from 'lucide-react';

export default function CustomerPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const storedRole = getStoredAppRole();

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

  if (!identity || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <CustomerDashboard />
      <CustomerBottomNav />
    </>
  );
}
