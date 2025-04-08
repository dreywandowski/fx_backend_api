export enum TransactionType {
  FUNDING = 'funding',
  WITHDRAWAL = 'withdrawal',
  PURCHASE = 'purchase',
  TRANSFER = 'transfer',
  REVERSAL = 'reversal',
  CONVERT = 'convert',
  TRADE = 'trade',
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SUCCESS = 'success',
}
