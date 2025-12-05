// src/utils/currency.js
// Minimal currency helper. For full conversion call external API from backend or let user set rate.
export const currencies = ['USD','EUR','JPY','CNY','GBP','AUD','CAD'];

export function formatAmount(amount, currency='USD') {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
}
