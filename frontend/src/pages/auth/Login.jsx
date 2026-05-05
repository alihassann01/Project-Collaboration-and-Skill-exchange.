import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function Login() {
  const { login } = useAuth()
  const navigate   = useNavigate()

  const [form, setForm]       = useState({ email: '', password: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.email)                             errs.email    = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email))  errs.email    = 'Enter a valid email address.'
    if (!form.password)                          errs.password = 'Password is required.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex">
      {/* Left branding panel — desktop only */}
      <div className="hidden md:flex md:w-5/12 lg:w-1/2 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 relative overflow-hidden flex-col justify-between p-10">
        <div className="grid-pattern absolute inset-0 opacity-100" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-white font-display text-base font-bold">S</span>
            </div>
            <span className="font-display font-700 text-white text-lg">SkillMarket</span>
          </div>
          <h2 className="font-display text-3xl lg:text-4xl font-700 text-white leading-tight mb-4">
            Where talent meets<br />opportunity.
          </h2>
          <p className="text-brand-200 text-base leading-relaxed max-w-xs">
            Post projects, swap skills, build your career — all in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {['React', 'Python', 'Laravel', 'UI Design', 'Node.js', 'Machine Learning'].map(s => (
              <span key={s} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 text-white/80 border border-white/10">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-4 border border-white/10">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">A</div>
            <div>
              <p className="text-white text-sm font-medium">"Got my first freelance project within a week!"</p>
              <p className="text-brand-300 text-xs mt-0.5">Ali Hassan · Full-Stack Developer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 bg-slate-50">
        <div className="w-full max-w-md animate-fade-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 md:hidden">
            <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-display text-sm font-bold">S</span>
            </div>
            <span className="font-display font-700 text-slate-900 text-base">SkillMarket</span>
          </div>

          <div className="mb-7">
            <h2 className="font-display text-2xl font-700 text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-slate-500 text-sm mt-1">Sign in to your account</p>
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-7">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <Input label="Email address" type="email" name="email" autoComplete="email"
                placeholder="you@example.com" value={form.email} onChange={set('email')} error={errors.email} />
              <Input label="Password" type="password" name="password" autoComplete="current-password"
                placeholder="••••••••" value={form.password} onChange={set('password')} error={errors.password} />
              <Button type="submit" loading={loading} className="w-full mt-1 py-3 text-base">
                Sign in <ArrowRight size={16} />
              </Button>
            </form>

            <div className="mt-5 pt-5 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
                  Create one free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
