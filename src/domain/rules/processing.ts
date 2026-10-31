/**
 * Processing rules: turning stock of one product into another (leite → queijo, abate → carne)
 */

import type { Lot } from '../contracts/types';

export class InsufficientStockError extends Error {
  constructor(public readonly missing: number) {
    super('INSUFFICIENT_STOCK');
  }
}

type LotSlice = Pick<Lot, 'id' | 'quantityRemaining' | 'expiresAtEstimate'>;

/**
 * Oldest-expiry-first consumption plan for `quantity` across `lots`.
 * ponytail: FIFO is automatic, the user never picks lots; add a lot picker when per-lot tracing matters.
 */
export function planFifoConsumption(lots: LotSlice[], quantity: number): { lotId: string; quantity: number }[] {
  const plan: { lotId: string; quantity: number }[] = [];
  let left = quantity;
  const fifo = [...lots].sort((a, b) => a.expiresAtEstimate.localeCompare(b.expiresAtEstimate));
  for (const lot of fifo) {
    if (left <= 0) break;
    if (lot.quantityRemaining <= 0) continue;
    const take = Math.min(lot.quantityRemaining, left);
    plan.push({ lotId: lot.id, quantity: take });
    left = Number((left - take).toFixed(6));
  }
  if (left > 0) throw new InsufficientStockError(left);
  return plan;
}
