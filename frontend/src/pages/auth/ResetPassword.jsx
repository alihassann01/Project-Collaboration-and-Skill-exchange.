import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Lock, Mail } from 'lucide-react'
import { resetPassword } from '../../api/auth'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: params.get('email') || '',
    token: params.get('token') || '',
    password: '',
    password_confirmation: '',
  })
  const [loading, setLoading] = useState(false)

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }
    if (form.password !== form.password_confirmation) {
      toast.error('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await resetPassword(form)
      toast.success('Password reset successfully.')
      navigate('/login', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-10 bg-slate-50">
      <div className="w-full max-w-md animate-fade-up">
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-7">
          <h1 className="font-display text-2xl font-bold text-slate-900">Reset password</h1>
          <p className="text-sm text-slate-500 mt-1 mb-6">Choose a new password for your account.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email address" type="email" leftIcon={Mail} value={form.email} onChange={set('email')} />
            <Input label="New password" type="password" leftIcon={Lock} value={form.password} onChange={set('password')} />
            <Input label="Confirm password" type="password" leftIcon={Lock} value={form.password_confirmation} onChange={set('password_confirmation')} />
            <Button type="submit" loading={loading} className="w-full py-3">
              Reset Password
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Remember it? <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
