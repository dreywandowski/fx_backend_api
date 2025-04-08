export function generateReference(): string {
  return `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
