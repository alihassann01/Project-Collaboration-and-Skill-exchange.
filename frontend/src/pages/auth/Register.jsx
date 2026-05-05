import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function Register() {
  const { register } = useAuth()
  const navigate      = useNavigate()

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'student',
  })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.name.trim())                           errs.name            = 'Full name is required.'
    if (!form.email)                                 errs.email           = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email))      errs.email           = 'Enter a valid email address.'
    if (!form.password)                              errs.password        = 'Password is required.'
    else if (form.password.length < 8)               errs.password        = 'Must be at least 8 characters.'
    if (!form.confirmPassword)                       errs.confirmPassword = 'Please confirm your password.'
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.'
    if (!['student','employer'].includes(form.role)) errs.role            = 'Select a role.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.role)
      toast.success('Account created! Welcome to SkillMarket 🎉')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const apiErrors = err.response?.data?.errors || {}
      if (Object.keys(apiErrors).length) setErrors(prev => ({ ...prev, ...apiErrors }))
      const msg = err.response?.data?.message || err.message || 'Registration failed.'
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
            Join 500+ students &amp; employers<br />already building their future.
          </h2>
          <p className="text-brand-200 text-base leading-relaxed max-w-sm">
            Create projects, swap skills with peers, and launch your career — completely free.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {['Web Dev', 'Data Science', 'UI/UX', 'Mobile', 'DevOps', 'AI/ML'].map(s => (
              <span key={s} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 text-white/80 border border-white/10">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-4 border border-white/10">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">S</div>
            <div>
              <p className="text-white text-sm font-medium">"Found amazing talent for my startup here!"</p>
              <p className="text-brand-300 text-xs mt-0.5">Sara Ahmed · TechCorp CEO</p>
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
            <h2 className="font-display text-2xl font-700 text-slate-900 tracking-tight">Create account</h2>
            <p className="text-slate-500 text-sm mt-1">Join SkillMarket for free</p>
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-7">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <Input
                label="Full name"
                name="name"
                autoComplete="name"
                placeholder="Muhammad Ali"
                value={form.name}
                onChange={set('name')}
                error={errors.name}
              />
              <Input
                label="Email address"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                error={errors.email}
              />
              <Input
                label="Password"
                type="password"
                name="password"
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={set('password')}
                error={errors.password}
              />
              <Input
                label="Confirm password"
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                error={errors.confirmPassword}
              />

              {/* Role selector */}
              <div className="flex flex-col gap-1">
                <label htmlFor="role" className="text-sm font-medium text-slate-700">I am a…</label>
                <div className="relative">
                  <select
                    id="role"
                    name="role"
                    value={form.role}
                    onChange={set('role')}
                    className={`
                      w-full appearance-none px-3.5 py-2.5 rounded-xl text-sm bg-slate-50
                      border transition-all duration-150 cursor-pointer pr-9
                      focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 focus:bg-white
                      ${errors.role ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-slate-300'}
                    `}
                  >
                    <option value="student">🎓 Student — looking for projects &amp; skills</option>
                    <option value="employer">🏢 Employer — posting projects &amp; hiring</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                {errors.role && <p className="field-error">{errors.role}</p>}
              </div>

              <Button type="submit" loading={loading} className="w-full mt-1 py-3 text-base">
                Create account <ArrowRight size={16} />
              </Button>
            </form>

            <div className="mt-5 pt-5 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
