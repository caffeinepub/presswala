import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import PartnerDashboard from '../components/PartnerDashboard';
import PartnerEarnings from '../components/PartnerEarnings';
import PartnerBottomNav from '../components/PartnerBottomNav';
import { Loader2 } from 'lucide-react';

export default function PartnerPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [activeTab, setActiveTab] = useState<'orders' | 'earnings'>('orders');

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

  if (!identity) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {activeTab === 'orders' ? <PartnerDashboard /> : <PartnerEarnings />}
      <PartnerBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  );
}
