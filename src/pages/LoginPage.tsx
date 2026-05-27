import { useState } from 'react'
import { Eye, EyeOff, Mail } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { useLang } from '../lib/i18n'

type Screen = 'login' | 'register' | 'check-email'

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()
  const { lang, toggle } = useLang()
  const isVi = lang === 'vi'

  const [screen, setScreen] = useState<Screen>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const go = (s: Screen) => {
    setScreen(s)
    setError('')
    setPassword('')
    setConfirmPassword('')
  }

  const handleLogin = async () => {
    if (!email || !password) return setError(isVi ? 'Vui lòng điền đầy đủ thông tin' : 'Please fill in all fields')
    setError(''); setLoading(true)
    const err = await signInWithEmail(email, password)
    setLoading(false)
    if (err) setError(isVi ? 'Email hoặc mật khẩu không đúng' : 'Invalid email or password')
  }

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword)
      return setError(isVi ? 'Vui lòng điền đầy đủ thông tin' : 'Please fill in all fields')
    if (password.length < 6)
      return setError(isVi ? 'Mật khẩu tối thiểu 6 ký tự' : 'Password must be at least 6 characters')
    if (password !== confirmPassword)
      return setError(isVi ? 'Mật khẩu xác nhận không khớp' : 'Passwords do not match')

    setError(''); setLoading(true)
    const err = await signUpWithEmail(email, password)
    setLoading(false)
    if (err) {
      setError(err)
    } else {
      go('check-email')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: '#0d1117', position: 'relative', overflow: 'hidden' }}>
      {/* Gradient orbs */}
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, #7c6ef725 0%, transparent 70%)', top: '-100px', left: '-100px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, #4ecdc425 0%, transparent 70%)', bottom: '-80px', right: '-80px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, #ff6b9d18 0%, transparent 70%)', top: '40%', right: '20%', pointerEvents: 'none' }} />
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 32 }}>
          <img src="/logo.png" style={{ width: 40, height: 40, borderRadius: 12 }} />
          <span style={{ fontWeight: 800, color: 'white', fontSize: 22 }}>QuiteProcess</span>
        </div>

        {/* ── Check email screen ── */}
        {screen === 'check-email' && (
          <div style={{ background: '#131929', border: '1px solid #1e2a3a', borderRadius: 20, padding: 32, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#7c6ef720', border: '1px solid #7c6ef740', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mail size={24} color="#7c6ef7" />
            </div>
            <div>
              <h2 style={{ color: 'white', fontWeight: 700, fontSize: 20, margin: '0 0 8px' }}>
                {isVi ? 'Kiểm tra email!' : 'Check your email!'}
              </h2>
              <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                {isVi
                  ? <>Chúng tôi đã gửi link xác nhận đến<br /><strong style={{ color: '#94a3b8' }}>{email}</strong><br />Nhấn vào link để kích hoạt tài khoản.</>
                  : <>We sent a confirmation link to<br /><strong style={{ color: '#94a3b8' }}>{email}</strong><br />Click the link to activate your account.</>
                }
              </p>
            </div>
            <div style={{ width: '100%', height: 1, background: '#1e2a3a' }} />
            <p style={{ color: '#475569', fontSize: 12, margin: 0 }}>
              {isVi ? 'Không thấy email? Kiểm tra thư mục spam.' : "Didn't receive it? Check your spam folder."}
            </p>
            <button
              onClick={() => go('login')}
              style={{ background: 'none', border: 'none', color: '#7c6ef7', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
            >
              ← {isVi ? 'Quay lại đăng nhập' : 'Back to sign in'}
            </button>
          </div>
        )}

        {/* ── Login screen ── */}
        {screen === 'login' && (
          <div style={{ background: '#131929', border: '1px solid #1e2a3a', borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ color: 'white', fontWeight: 700, fontSize: 20, margin: '0 0 6px' }}>
                {isVi ? 'Đăng nhập' : 'Sign in'}
              </h2>
              <p style={{ color: '#475569', fontSize: 13, margin: 0 }}>
                {isVi ? 'Chào mừng trở lại!' : 'Welcome back!'}
              </p>
            </div>

            <GoogleBtn isVi={isVi} onClick={signInWithGoogle} />
            <Divider isVi={isVi} />

            <EmailInput value={email} onChange={setEmail} isVi={isVi} />
            <PasswordInput
              value={password} onChange={setPassword}
              show={showPassword} onToggle={() => setShowPassword(s => !s)}
              placeholder={isVi ? 'Mật khẩu' : 'Password'}
              onEnter={handleLogin}
            />

            {error && <ErrorMsg msg={error} />}

            <SubmitBtn loading={loading} onClick={handleLogin} label={isVi ? 'Đăng nhập' : 'Sign in'} />

            <p style={{ textAlign: 'center', fontSize: 13, color: '#475569', margin: 0 }}>
              {isVi ? 'Chưa có tài khoản? ' : "Don't have an account? "}
              <TextBtn onClick={() => go('register')} label={isVi ? 'Đăng ký' : 'Sign up'} />
            </p>
          </div>
        )}

        {/* ── Register screen ── */}
        {screen === 'register' && (
          <div style={{ background: '#131929', border: '1px solid #1e2a3a', borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ color: 'white', fontWeight: 700, fontSize: 20, margin: '0 0 6px' }}>
                {isVi ? 'Tạo tài khoản' : 'Create account'}
              </h2>
              <p style={{ color: '#475569', fontSize: 13, margin: 0 }}>
                {isVi ? 'Miễn phí, không cần thẻ tín dụng' : 'Free, no credit card required'}
              </p>
            </div>

            <GoogleBtn isVi={isVi} onClick={signInWithGoogle} />
            <Divider isVi={isVi} />

            <EmailInput value={email} onChange={setEmail} isVi={isVi} />
            <PasswordInput
              value={password} onChange={setPassword}
              show={showPassword} onToggle={() => setShowPassword(s => !s)}
              placeholder={isVi ? 'Mật khẩu (tối thiểu 6 ký tự)' : 'Password (min. 6 characters)'}
            />
            <PasswordInput
              value={confirmPassword} onChange={setConfirmPassword}
              show={showConfirm} onToggle={() => setShowConfirm(s => !s)}
              placeholder={isVi ? 'Xác nhận mật khẩu' : 'Confirm password'}
              onEnter={handleRegister}
            />

            {error && <ErrorMsg msg={error} />}

            <SubmitBtn loading={loading} onClick={handleRegister} label={isVi ? 'Tạo tài khoản' : 'Sign up'} />

            <p style={{ textAlign: 'center', fontSize: 13, color: '#475569', margin: 0 }}>
              {isVi ? 'Đã có tài khoản? ' : 'Already have an account? '}
              <TextBtn onClick={() => go('login')} label={isVi ? 'Đăng nhập' : 'Sign in'} />
            </p>
          </div>
        )}

        {/* Lang toggle */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={toggle} style={{ background: 'none', border: 'none', color: '#334155', cursor: 'pointer', fontSize: 13 }}>
            {lang === 'en' ? '🇻🇳 Tiếng Việt' : '🇬🇧 English'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ──

function GoogleBtn({ isVi, onClick }: { isVi: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ width: '100%', padding: '10px 16px', borderRadius: 10, background: 'white', color: '#1a1a1a', fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <svg width="17" height="17" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {isVi ? 'Tiếp tục với Google' : 'Continue with Google'}
    </button>
  )
}

function Divider({ isVi }: { isVi: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1, height: 1, background: '#1e2a3a' }} />
      <span style={{ color: '#334155', fontSize: 12 }}>{isVi ? 'hoặc' : 'or'}</span>
      <div style={{ flex: 1, height: 1, background: '#1e2a3a' }} />
    </div>
  )
}

function EmailInput({ value, onChange, isVi }: { value: string; onChange: (v: string) => void; isVi: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ color: '#64748b', fontSize: 12, fontWeight: 500 }}>Email</label>
      <input
        type="email" value={value} onChange={e => onChange(e.target.value)}
        placeholder={isVi ? 'ten@email.com' : 'you@email.com'}
        style={{ padding: '10px 14px', borderRadius: 10, background: '#0d1520', border: '1px solid #1e2a3a', color: 'white', fontSize: 14, outline: 'none' }}
      />
    </div>
  )
}

function PasswordInput({ value, onChange, show, onToggle, placeholder, onEnter }: {
  value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void
  placeholder: string; onEnter?: () => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ color: '#64748b', fontSize: 12, fontWeight: 500 }}>{placeholder}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onEnter?.()}
          placeholder="••••••••"
          style={{ width: '100%', padding: '10px 40px 10px 14px', borderRadius: 10, background: '#0d1520', border: '1px solid #1e2a3a', color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
        />
        <button onClick={onToggle} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: 0, display: 'flex' }}>
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  )
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div style={{ color: '#f87171', fontSize: 12, padding: '8px 12px', borderRadius: 8, background: '#f8717115', border: '1px solid #f8717130' }}>
      {msg}
    </div>
  )
}

function SubmitBtn({ loading, onClick, label }: { loading: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} disabled={loading}
      style={{ width: '100%', padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #7c6ef7, #4ecdc4)', color: 'white', fontWeight: 600, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
      {loading ? '...' : label}
    </button>
  )
}

function TextBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} style={{ background: 'none', border: 'none', color: '#7c6ef7', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
      {label}
    </button>
  )
}
