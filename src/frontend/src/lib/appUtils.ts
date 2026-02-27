import { OrderStatus } from '../backend';
import type { Order } from '../backend';

// ── Pricing Constants ────────────────────────────────────────────────────────

export const SHIRT_PRICE = 12;
export const PANT_PRICE = 12;
export const DRESS_PRICE = 20;

export function calculateOrderTotal(shirts: number, pants: number, dresses: number): number {
  return shirts * SHIRT_PRICE + pants * PANT_PRICE + dresses * DRESS_PRICE;
}

// ── Formatting Helpers ───────────────────────────────────────────────────────

/** Format a bigint or number rupee amount as a plain number string (no symbol). */
export function formatCurrency(amount: bigint | number): string {
  return Number(amount).toLocaleString('en-IN');
}

/** Format a nanosecond timestamp (ICP canister time) as a human-readable date string. */
export function formatDate(nanos: bigint): string {
  // ICP timestamps are in nanoseconds; convert to milliseconds
  const ms = Number(nanos) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Format order items as a readable string, e.g. "2 Shirts, 1 Pant, 3 Dresses" */
export function formatItemBreakdown(order: Order): string {
  const parts: string[] = [];
  const shirts = Number(order.shirts);
  const pants = Number(order.pants);
  const dresses = Number(order.dresses);
  if (shirts > 0) parts.push(`${shirts} Shirt${shirts !== 1 ? 's' : ''}`);
  if (pants > 0) parts.push(`${pants} Pant${pants !== 1 ? 's' : ''}`);
  if (dresses > 0) parts.push(`${dresses} Dress${dresses !== 1 ? 'es' : ''}`);
  return parts.length > 0 ? parts.join(', ') : 'No items';
}

// ── Status Helpers ───────────────────────────────────────────────────────────

const STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.pending]: 'Pending',
  [OrderStatus.accepted]: 'Accepted',
  [OrderStatus.pickedUp]: 'Picked Up',
  [OrderStatus.ironing]: 'Ironing',
  [OrderStatus.delivered]: 'Delivered',
  [OrderStatus.cancelled]: 'Cancelled',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.pending]: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  [OrderStatus.accepted]: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  [OrderStatus.pickedUp]: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
  [OrderStatus.ironing]: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  [OrderStatus.delivered]: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  [OrderStatus.cancelled]: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
};

export function getStatusLabel(status: OrderStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export function getStatusColor(status: OrderStatus): string {
  return STATUS_COLORS[status] ?? 'bg-muted text-muted-foreground border-border';
}

// ── Partner Status Progression ───────────────────────────────────────────────

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  [OrderStatus.accepted]: OrderStatus.pickedUp,
  [OrderStatus.pickedUp]: OrderStatus.ironing,
  [OrderStatus.ironing]: OrderStatus.delivered,
};

const NEXT_STATUS_LABELS: Partial<Record<OrderStatus, string>> = {
  [OrderStatus.accepted]: 'Mark as Picked Up',
  [OrderStatus.pickedUp]: 'Mark as Ironing',
  [OrderStatus.ironing]: 'Mark as Delivered',
};

export function getNextStatus(current: OrderStatus): OrderStatus | null {
  return NEXT_STATUS[current] ?? null;
}

export function getNextStatusLabel(current: OrderStatus): string | null {
  return NEXT_STATUS_LABELS[current] ?? null;
}
