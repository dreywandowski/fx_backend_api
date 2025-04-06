export enum Currency {
  NGN = 'naira',
  USD = 'dollar',
  GBP = 'pound',
  EUR = 'euro',
}

export enum TransactionType {
  FUNDING = 'funding',
  WITHDRAWAL = 'withdrawal',
  PURCHASE = 'purchase',
  TRANSFER = 'transfer',
  REVERSAL = 'reversal',
}
export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}
