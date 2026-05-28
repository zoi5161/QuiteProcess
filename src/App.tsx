import { useState, useEffect } from 'react'
import { CheckSquare, Calendar, LogOut } from 'lucide-react'
import TaskTrackerPage from './pages/TaskTrackerPage'
import HabitTrackerPage from './pages/HabitTrackerPage'
import LoginPage from './pages/LoginPage'
import { useLang } from './lib/i18n'
import { useAuth } from './lib/auth'
import { useMobile } from './hooks/useMobile'

type Tab = 'tasks' | 'habits'

export default function App() {
  const [tab, setTab] = useState<Tab>(
    () => (localStorage.getItem('tab') as Tab) ?? 'tasks'
  )

  const switchTab = (t: Tab) => {
    localStorage.setItem('tab', t)
    setTab(t)
  }
  const { t, lang, toggle } = useLang()
  const { user, loading, signOut } = useAuth()
  const isMobile = useMobile()

  useEffect(() => {
    document.title = 'Quite Progress'
  }, [])

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1117' }}>
        <div style={{ color: '#475569', fontSize: 14 }}>Loading...</div>
      </div>
    )
  }

  if (!user) return <LoginPage />

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0d1117', overflow: 'hidden' }}>
      <nav style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
        borderBottom: '1px solid #1e2a3a', background: '#0d1117', flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8, flexShrink: 0 }}>
          <img src="/logo.png" style={{ width: 28, height: 28, borderRadius: 8 }} />
          {!isMobile && <span style={{ fontWeight: 700, color: 'white', fontSize: 14 }}>Quite Progress</span>}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          {([
            { id: 'tasks', label: t.taskTracker, icon: CheckSquare },
            { id: 'habits', label: t.habitTracker, icon: Calendar },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => switchTab(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: isMobile ? '6px 10px' : '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                cursor: 'pointer', transition: 'all 0.15s',
                background: tab === id ? '#7c6ef720' : 'transparent',
                color: tab === id ? '#7c6ef7' : '#64748b',
                border: `1px solid ${tab === id ? '#7c6ef740' : 'transparent'}`,
              }}
            >
              <Icon size={13} />
              {!isMobile && label}
            </button>
          ))}
        </div>

        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10 }}>
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {user.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="" referrerPolicy="no-referrer" style={{ width: 26, height: 26, borderRadius: '50%' }} />
            ) : (
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#7c6ef730', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#7c6ef7', fontWeight: 700 }}>
                {(user.email ?? 'U')[0].toUpperCase()}
              </div>
            )}
            {!isMobile && (
              <span style={{ color: '#64748b', fontSize: 12, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.user_metadata?.full_name ?? user.email}
              </span>
            )}
          </div>

          {/* Lang toggle */}
          <button
            onClick={toggle}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 8px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: '#1e2a3a', color: '#94a3b8', border: '1px solid #2d3f55' }}
          >
            <span style={{ fontSize: 13 }}>{lang === 'en' ? '🇻🇳' : '🇬🇧'}</span>
            {!isMobile && (lang === 'en' ? 'VI' : 'EN')}
          </button>

          {/* Sign out */}
          <button
            onClick={signOut}
            title={lang === 'vi' ? 'Đăng xuất' : 'Sign out'}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 8px', borderRadius: 8, fontSize: 12, cursor: 'pointer', background: 'none', color: '#475569', border: '1px solid #1e2a3a' }}
          >
            <LogOut size={13} />
            {!isMobile && <span>{lang === 'vi' ? 'Đăng xuất' : 'Sign out'}</span>}
          </button>
        </div>
      </nav>

      <main style={{ flex: 1, overflow: isMobile ? 'auto' : 'hidden', display: 'flex', flexDirection: 'column' }}>
        {tab === 'tasks' && <TaskTrackerPage />}
        {tab === 'habits' && <HabitTrackerPage />}
      </main>
    </div>
  )
}
