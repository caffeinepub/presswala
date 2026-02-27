import { useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import OrderDetailView from '../components/OrderDetailView';
import CustomerBottomNav from '../components/CustomerBottomNav';

export default function OrderDetailPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { orderId } = useParams({ from: '/customer/orders/$orderId' });

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

  if (!identity || !orderId) return null;

  return (
    <>
      <OrderDetailView orderId={BigInt(orderId)} />
      <CustomerBottomNav />
    </>
  );
}
