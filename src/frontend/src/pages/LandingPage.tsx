import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from '../hooks/useQueries';
import { getStoredAppRole } from '../lib/roleStorage';
import HeroBanner from '../components/HeroBanner';
import ProfileSetupModal from '../components/ProfileSetupModal';
import RoleSelectModal from '../components/RoleSelectModal';
import { type AppRole } from '../lib/roleStorage';
import { Loader2 } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: profile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const { isLoading: adminLoading } = useIsCallerAdmin();

  const storedRole = getStoredAppRole();

  const showProfileSetup = isAuthenticated && profileFetched && !profileLoading && profile === null;
  // Show role select for ALL authenticated users (including admins) when no role is stored yet
  const showRoleSelect = isAuthenticated && profileFetched && !profileLoading && profile !== null && !storedRole;

  const handleRoleSelect = (role: AppRole) => {
    if (role === 'customer') {
      navigate({ to: '/customer' });
    } else if (role === 'owner') {
      navigate({ to: '/owner/dashboard' });
    } else if (role === 'admin') {
      if (isAuthenticated) {
        navigate({ to: '/admin' });
      }
    }
  };

  useEffect(() => {
    if (!isAuthenticated || profileLoading || !profileFetched || adminLoading) return;

    if (profile === null) return; // show profile setup

    // Only auto-redirect if a role was previously stored (return visit)
    // Do NOT auto-redirect to /admin just because isAdmin is true — let the user choose
    if (storedRole === 'customer') {
      navigate({ to: '/customer' });
    } else if (storedRole === 'owner') {
      navigate({ to: '/owner/dashboard' });
    } else if (storedRole === 'admin') {
      if (isAuthenticated) {
        navigate({ to: '/admin' });
      }
    }
    // If no storedRole, show the role select modal (works for both regular users and admins)
  }, [isAuthenticated, profile, profileFetched, profileLoading, adminLoading, storedRole, navigate]);

  if (isInitializing || (isAuthenticated && (profileLoading || adminLoading))) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <HeroBanner />;
  }

  return (
    <>
      <ProfileSetupModal open={showProfileSetup} />
      <RoleSelectModal open={showRoleSelect} onSelect={handleRoleSelect} />
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    </>
  );
}
