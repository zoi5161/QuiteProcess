import { useLang } from '../lib/i18n'

interface Props {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({ message, onConfirm, onCancel }: Props) {
  const { t } = useLang()

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#131929', border: '1px solid #1e2a3a', borderRadius: 14,
          padding: '24px 28px', minWidth: 280, maxWidth: 360,
          display: 'flex', flexDirection: 'column', gap: 20,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ color: 'white', fontSize: 14, lineHeight: 1.5, textAlign: 'center' }}>
          {message}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '8px 16px', borderRadius: 8, fontSize: 13,
              background: 'none', color: '#64748b', border: '1px solid #1e2a3a', cursor: 'pointer',
            }}
          >
            {t.cancel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', cursor: 'pointer',
            }}
          >
            {t.delete}
          </button>
        </div>
      </div>
    </div>
  )
}
