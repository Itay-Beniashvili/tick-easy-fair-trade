// Centralised currency formatting. TickEasy is an Israeli product, so money is ILS (₪),
// even while the UI copy is still in English (Hebrew/RTL is a later phase).
const ils = new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 0,
});

export function formatILS(amount: number): string {
  return ils.format(amount);
}
