import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowRight, GraduationCap, Building2, Mail, Lock, User, Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

function PasswordStrength({ password }) {
  const len = password.length
  const strength = len === 0 ? 0 : len < 6 ? 1 : len < 8 ? 2 : len < 12 ? 3 : 4
  const colors = ['bg-slate-200', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-500']
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  if (len === 0) return null
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1,2,3,4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= strength ? colors[strength] : 'bg-slate-100'}`} />
        ))}
      </div>
      <p className={`text-[10px] font-medium mt-1 ${strength <= 1 ? 'text-red-500' : strength <= 2 ? 'text-orange-500' : strength <= 3 ? 'text-yellow-600' : 'text-emerald-600'}`}>
        {labels[strength]}
      </p>
    </div>
  )
}

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

  const isStudent = form.role === 'student'

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex">
      {/* Left branding panel — desktop only */}
      <div className="hidden md:flex md:w-5/12 lg:w-1/2 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 relative overflow-hidden flex-col justify-between p-10">
        <div className="grid-pattern absolute inset-0 opacity-100" />
        <div className="absolute top-20 right-10 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-32 left-10 w-48 h-48 bg-brand-400/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '3s' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-white font-display text-base font-bold">S</span>
            </div>
            <span className="font-display font-bold text-white text-lg">SkillMarket</span>
          </div>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
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
            <span className="font-display font-bold text-slate-900 text-base">SkillMarket</span>
          </div>

          <div className="mb-7">
            <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight">Create account</h2>
            <p className="text-slate-500 text-sm mt-1">Join SkillMarket for free</p>
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-7">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

              {/* Role Selection Cards */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">I am a…</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, role: 'student' }))}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      isStudent
                        ? 'border-student-500 bg-student-50 shadow-glow-student'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {isStudent && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-student-500 flex items-center justify-center">
                        <Check size={12} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                    <GraduationCap size={24} className={isStudent ? 'text-student-600' : 'text-slate-400'} />
                    <p className={`font-semibold text-sm mt-2 ${isStudent ? 'text-student-700' : 'text-slate-700'}`}>Student</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">Find projects &amp; swap skills</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, role: 'employer' }))}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      !isStudent
                        ? 'border-employer-500 bg-employer-50 shadow-glow-employer'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {!isStudent && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-employer-500 flex items-center justify-center">
                        <Check size={12} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                    <Building2 size={24} className={!isStudent ? 'text-employer-600' : 'text-slate-400'} />
                    <p className={`font-semibold text-sm mt-2 ${!isStudent ? 'text-employer-700' : 'text-slate-700'}`}>Employer</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">Post projects &amp; hire talent</p>
                  </button>
                </div>
                {errors.role && <p className="field-error">{errors.role}</p>}
              </div>

              <Input label="Full name" name="name" autoComplete="name" leftIcon={User}
                placeholder="Muhammad Ali" value={form.name} onChange={set('name')} error={errors.name} />
              <Input label="Email address" type="email" name="email" autoComplete="email" leftIcon={Mail}
                placeholder="you@example.com" value={form.email} onChange={set('email')} error={errors.email} />
              <div>
                <Input label="Password" type="password" name="password" autoComplete="new-password" leftIcon={Lock}
                  placeholder="Min. 8 characters" value={form.password} onChange={set('password')} error={errors.password} />
                <PasswordStrength password={form.password} />
              </div>
              <Input label="Confirm password" type="password" name="confirmPassword" autoComplete="new-password" leftIcon={Lock}
                placeholder="Repeat your password" value={form.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} />

              <Button
                type="submit"
                loading={loading}
                variant={isStudent ? 'student' : 'employer'}
                className="w-full mt-1 py-3 text-base"
              >
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
