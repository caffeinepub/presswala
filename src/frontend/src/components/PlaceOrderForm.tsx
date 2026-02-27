import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePlaceOrder, useGetActiveClothingItems } from '../hooks/useQueries';
import { toast } from 'sonner';
import {
  Loader2,
  MapPin,
  Shirt,
  ArrowLeft,
  IndianRupee,
  Banknote,
  CreditCard,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { SHIRT_PRICE, PANT_PRICE, DRESS_PRICE } from '../lib/appUtils';
import type { ClothingItem } from '../backend';

// Default fallback items when the catalog returns nothing
const DEFAULT_ITEMS: Array<{ id: string; name: string; price: number; isDefault: true }> = [
  { id: 'shirt', name: 'Shirt', price: SHIRT_PRICE, isDefault: true },
  { id: 'pant', name: 'Pant', price: PANT_PRICE, isDefault: true },
  { id: 'dress', name: 'Dress', price: DRESS_PRICE, isDefault: true },
];

type PaymentMethod = 'cash' | 'online' | null;

export default function PlaceOrderForm() {
  const navigate = useNavigate();
  const { data: catalogItems, isLoading: catalogLoading } = useGetActiveClothingItems();
  const placeOrder = usePlaceOrder();

  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  // quantities keyed by item id (string for catalog items, 'shirt'/'pant'/'dress' for defaults)
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const useCatalog = catalogItems && catalogItems.length > 0;
  const displayItems: Array<{ id: string; name: string; price: number; catalogItem?: ClothingItem }> =
    useCatalog
      ? catalogItems.map((item) => ({
          id: item.id.toString(),
          name: item.name,
          price: Number(item.pricePerItem),
          catalogItem: item,
        }))
      : DEFAULT_ITEMS.map((d) => ({ id: d.id, name: d.name, price: d.price }));

  const totalItems = displayItems.reduce((sum, item) => sum + (quantities[item.id] ?? 0), 0);
  const totalAmount = displayItems.reduce(
    (sum, item) => sum + (quantities[item.id] ?? 0) * item.price,
    0,
  );

  const isValid =
    address.trim().length >= 10 &&
    totalItems >= 1 &&
    paymentMethod !== null;

  const handleSetQty = (id: string, val: number) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(0, Math.min(500, val)) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !paymentMethod) return;

    // Build legacy shirt/pant/dress params from quantities
    let shirts = BigInt(0);
    let pants = BigInt(0);
    let dresses = BigInt(0);

    if (!useCatalog) {
      shirts = BigInt(quantities['shirt'] ?? 0);
      pants = BigInt(quantities['pant'] ?? 0);
      dresses = BigInt(quantities['dress'] ?? 0);
    }

    // Build itemQuantities from catalog items
    const itemQuantities = useCatalog
      ? displayItems
          .filter((item) => (quantities[item.id] ?? 0) > 0)
          .map((item) => ({
            itemId: item.catalogItem!.id,
            quantity: BigInt(quantities[item.id] ?? 0),
          }))
      : [];

    try {
      const orderId = await placeOrder.mutateAsync({
        address: address.trim(),
        shirts,
        pants,
        dresses,
        itemQuantities,
        paymentMethod,
      });
      toast.success(`Order #${orderId} placed! 🎉`);
      navigate({ to: '/customer' });
    } catch {
      toast.error('Failed to place order. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate({ to: '/customer' })}
          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-foreground">Place New Order</h1>
          <p className="text-sm text-muted-foreground">Pickup & ironing at your doorstep</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ── Address ──────────────────────────────────────────────── */}
        <div className="bg-card rounded-xl p-5 shadow-card border border-border space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="address" className="font-semibold flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" />
              Pickup Address
            </Label>
            <Textarea
              id="address"
              placeholder="Enter your full address with landmark..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="resize-none"
            />
            {address.length > 0 && address.trim().length < 10 && (
              <p className="text-xs text-muted-foreground">Please enter a more detailed address</p>
            )}
          </div>
        </div>

        {/* ── Items ────────────────────────────────────────────────── */}
        <div className="bg-card rounded-xl p-5 shadow-card border border-border space-y-5">
          <div className="flex items-center gap-1.5 mb-1">
            <Shirt className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm text-foreground">Select Items</span>
            {catalogLoading && (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground ml-1" />
            )}
          </div>

          {displayItems.map((item) => (
            <ItemCounter
              key={item.id}
              label={item.name}
              price={item.price}
              value={quantities[item.id] ?? 0}
              onChange={(val) => handleSetQty(item.id, val)}
            />
          ))}

          {totalItems === 0 && (
            <p className="text-xs text-muted-foreground text-center pt-1">
              Add at least one item to continue
            </p>
          )}
        </div>

        {/* ── Price Summary ─────────────────────────────────────────── */}
        {totalItems > 0 && (
          <div className="bg-accent rounded-xl p-4 border border-primary/20 space-y-2">
            <p className="text-sm font-semibold text-foreground mb-2">Price Breakdown</p>
            {displayItems
              .filter((item) => (quantities[item.id] ?? 0) > 0)
              .map((item) => {
                const qty = quantities[item.id] ?? 0;
                return (
                  <div key={item.id} className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {qty} {item.name}
                      {qty !== 1 ? 's' : ''} × ₹{item.price}
                    </span>
                    <span>₹{qty * item.price}</span>
                  </div>
                );
              })}
            <div className="flex items-center justify-between pt-2 border-t border-primary/20">
              <p className="text-sm font-medium text-foreground">Total</p>
              <div className="flex items-center gap-1 text-2xl font-extrabold text-primary">
                <IndianRupee className="w-5 h-5" />
                {totalAmount}
              </div>
            </div>
          </div>
        )}

        {/* ── Payment Method ────────────────────────────────────────── */}
        <div className="bg-card rounded-xl p-5 shadow-card border border-border space-y-4">
          <div className="flex items-center gap-1.5 mb-1">
            <CreditCard className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm text-foreground">Payment Method</span>
            {paymentMethod === null && totalItems >= 1 && (
              <span className="ml-1 text-xs text-destructive font-medium">(required)</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Cash on Delivery */}
            <button
              type="button"
              onClick={() => setPaymentMethod('cash')}
              className={`relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                paymentMethod === 'cash'
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20'
                  : 'border-border bg-background hover:border-amber-300 hover:bg-amber-50/50 dark:hover:bg-amber-950/10'
              }`}
            >
              {paymentMethod === 'cash' && (
                <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-amber-500" />
              )}
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Banknote className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-center">
                <p className="font-bold text-sm text-foreground">Cash on Delivery</p>
                <p className="text-xs text-muted-foreground mt-0.5">Pay when clothes are picked up</p>
              </div>
            </button>

            {/* Online Payment */}
            <button
              type="button"
              onClick={() => setPaymentMethod('online')}
              className={`relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                paymentMethod === 'online'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                  : 'border-border bg-background hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-950/10'
              }`}
            >
              {paymentMethod === 'online' && (
                <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-blue-500" />
              )}
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-center">
                <p className="font-bold text-sm text-foreground">Online Payment</p>
                <p className="text-xs text-muted-foreground mt-0.5">UPI / Card · confirm on pickup</p>
              </div>
            </button>
          </div>
        </div>

        {/* ── Submit ────────────────────────────────────────────────── */}
        <Button
          type="submit"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-12 text-base"
          disabled={!isValid || placeOrder.isPending}
        >
          {placeOrder.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Placing Order...
            </>
          ) : (
            <>
              <Package className="w-5 h-5 mr-2" />
              Confirm Order — ₹{totalAmount}
            </>
          )}
        </Button>

        {!isValid && totalItems >= 1 && address.trim().length >= 10 && paymentMethod === null && (
          <p className="text-xs text-destructive text-center -mt-2">
            Please select a payment method to continue
          </p>
        )}
      </form>
    </div>
  );
}

interface ItemCounterProps {
  label: string;
  price: number;
  value: number;
  onChange: (val: number) => void;
}

function ItemCounter({ label, price, value, onChange }: ItemCounterProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">₹{price} each</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-base font-bold hover:bg-accent transition-colors disabled:opacity-40"
          disabled={value === 0}
        >
          −
        </button>
        <Input
          type="number"
          min={0}
          max={500}
          value={value}
          onChange={(e) => onChange(Math.max(0, Math.min(500, parseInt(e.target.value) || 0)))}
          className="text-center font-bold text-base w-16 h-8 px-1"
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(500, value + 1))}
          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-base font-bold hover:bg-accent transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}
