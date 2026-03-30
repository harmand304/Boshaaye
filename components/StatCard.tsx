import { formatUSD, formatIQD } from '@/lib/format'

interface StatCardProps {
  label: string
  usd: number
  iqd: number
  /** Optional: highlight the card differently (e.g. Main Budget can go negative) */
  highlight?: boolean
}

export default function StatCard({ label, usd, iqd, highlight }: StatCardProps) {
  const isNegativeUSD = usd < 0
  const isNegativeIQD = iqd < 0

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: highlight ? 'var(--color-brand)' : 'var(--color-surface-border)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderRadius: '0.75rem',
        padding: '1.25rem',
      }}
    >
      <p
        style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: 'var(--color-text-secondary)',
          marginBottom: '0.75rem',
        }}
      >
        {label}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {/* USD row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>USD</span>
          <span
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
              color: isNegativeUSD ? 'var(--color-danger)' : 'var(--color-text-primary)',
            }}
          >
            {formatUSD(usd)}
          </span>
        </div>

        {/* Divider */}
        <hr style={{ borderColor: 'var(--color-surface-border)', margin: '0.1rem 0' }} />

        {/* IQD row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>IQD</span>
          <span
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
              color: isNegativeIQD ? 'var(--color-danger)' : 'var(--color-text-primary)',
            }}
          >
            {formatIQD(iqd)}
          </span>
        </div>
      </div>
    </div>
  )
}
