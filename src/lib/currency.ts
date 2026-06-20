// Centralised currency formatting. TickEasy is an Israeli product, so money is ILS (₪).
// While the UI copy is still English/LTR we format symbol-first ("₪350") for clean
// rendering; the he-IL trailing-symbol form returns when the UI moves to Hebrew/RTL.
const ils = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 0,
});

export function formatILS(amount: number): string {
  return ils.format(amount);
}
