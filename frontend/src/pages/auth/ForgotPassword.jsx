import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Mail, ArrowLeft, Copy, ExternalLink } from 'lucide-react'
import { forgotPassword } from '../../api/auth'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetUrl, setResetUrl] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Enter a valid email address.')
      return
    }

    setLoading(true)
    setResetUrl('')
    try {
      const res = await forgotPassword({ email })
      const data = res.data.data ?? {}
      if (data.reset_url) setResetUrl(data.reset_url)
      toast.success(res.data.message || 'Reset link generated.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate reset link.')
    } finally {
      setLoading(false)
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(resetUrl)
    toast.success('Reset link copied.')
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-10 bg-slate-50">
      <div className="w-full max-w-md animate-fade-up">
        <Link to="/login" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600 mb-5">
          <ArrowLeft size={14} /> Back to login
        </Link>

        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-7">
          <h1 className="font-display text-2xl font-bold text-slate-900">Forgot password</h1>
          <p className="text-sm text-slate-500 mt-1 mb-6">Enter your account email to generate a local reset link.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              name="email"
              autoComplete="email"
              leftIcon={Mail}
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Button type="submit" loading={loading} className="w-full py-3">
              Generate Reset Link
            </Button>
          </form>

          {resetUrl && (
            <div className="mt-5 rounded-xl border border-brand-100 bg-brand-50 p-4">
              <p className="text-xs font-semibold text-brand-700 mb-2">Local reset link</p>
              <p className="text-xs text-slate-600 break-all">{resetUrl}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={copyLink} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  <Copy size={13} /> Copy
                </button>
                <a href={resetUrl} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-600 text-xs font-semibold text-white hover:bg-brand-700">
                  <ExternalLink size={13} /> Open
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
