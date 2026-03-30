/**
 * Format a number as USD: $1,234.56
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format a number as IQD: IQD 1,234,567
 * No decimal places (IQD is typically whole numbers in practice).
 */
export function formatIQD(amount: number): string {
  return (
    'IQD ' +
    new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  )
}
