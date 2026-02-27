import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import PlaceOrderForm from '../components/PlaceOrderForm';
import CustomerBottomNav from '../components/CustomerBottomNav';

export default function PlaceOrderPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

  if (!identity) return null;

  return (
    <>
      <PlaceOrderForm />
      <CustomerBottomNav />
    </>
  );
}
