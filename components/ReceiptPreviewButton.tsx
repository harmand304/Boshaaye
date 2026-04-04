'use client'

import { useState } from 'react'
import { Paperclip, X, FileText, Image as ImageIcon, ExternalLink } from 'lucide-react'

interface Props {
  receiptUrl: string
  receiptFileName: string | null
  receiptMimeType: string | null
}

export default function ReceiptPreviewButton({ receiptUrl, receiptFileName, receiptMimeType }: Props) {
  const [open, setOpen] = useState(false)

  const isPdf = receiptMimeType === 'application/pdf'

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title={receiptFileName || 'View receipt'}
        className="inline-flex items-center justify-center w-7 h-7 rounded text-[var(--color-text-muted)] hover:text-[var(--color-brand)] hover:bg-[var(--color-brand)]/10 transition-colors"
      >
        <Paperclip size={14} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-surface-border)]">
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-primary)]">
                {isPdf ? <FileText size={16} className="text-rose-400" /> : <ImageIcon size={16} className="text-blue-400" />}
                <span className="truncate max-w-xs">{receiptFileName || 'Receipt'}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[var(--color-brand)] hover:underline"
                  onClick={e => e.stopPropagation()}
                >
                  <ExternalLink size={13} />
                  Open full size
                </a>
                <button
                  onClick={() => setOpen(false)}
                  className="ml-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-[var(--color-surface-muted)]">
              {isPdf ? (
                <div className="text-center space-y-4">
                  <FileText size={48} className="mx-auto text-[var(--color-text-muted)] opacity-50" />
                  <p className="text-sm text-[var(--color-text-secondary)]">PDF receipts cannot be previewed inline.</p>
                  <a
                    href={receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[var(--color-brand)] text-black px-5 py-2 rounded-lg text-sm font-bold hover:bg-[var(--color-brand-light)] transition-colors"
                  >
                    <ExternalLink size={14} />
                    Open PDF
                  </a>
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={receiptUrl}
                  alt={receiptFileName || 'Receipt'}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
