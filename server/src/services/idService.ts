import { Counter } from '../models/Counter.js';

export type IdPrefix = 'MNTR' | 'STD' | 'ADM';

/**
 * Generates an atomic sequential ID for a given prefix.
 * Format: Prefix + 4-digit zero-padded number (e.g. MNTR0001, STD0001, ADM0001).
 * If seq exceeds 9999, it continues with 5+ digits without wrapping.
 */
export async function generateNextId(prefix: IdPrefix): Promise<string> {
  const counter = await Counter.findOneAndUpdate(
    { _id: prefix },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const seq = counter.seq;
  const numStr = seq < 10000 ? String(seq).padStart(4, '0') : String(seq);
  return `${prefix}${numStr}`;
}

/**
 * Initializes or bumps the counter sequence for a prefix if minSeq is higher than current sequence.
 */
export async function setCounterMinSeq(prefix: IdPrefix, minSeq: number): Promise<void> {
  const current = await Counter.findById(prefix);
  if (!current) {
    await Counter.create({ _id: prefix, seq: minSeq });
  } else if (current.seq < minSeq) {
    current.seq = minSeq;
    await current.save();
  }
}
