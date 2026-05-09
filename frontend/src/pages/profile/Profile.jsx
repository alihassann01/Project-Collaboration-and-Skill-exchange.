import { useEffect, useState } from 'react'
import { getProfile, updateProfile } from '../../api/profile'
import { getInitials, roleBadge, availabilityOptions, chipColorClass } from '../../utils/format'
import toast from 'react-hot-toast'
import { MapPin, Globe, Edit2, X, Check, ChevronDown } from 'lucide-react'

// Bug 6: Normalize URLs without protocol
function normalizeUrl(url) {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return 'https://' + url
}

function SkillTag({ label, index = 0 }) {
  return (
    <span className={chipColorClass(index)}>
      {label}
    </span>
  )
}

function SkillTagInput({ value, onChange, placeholder }) {
  const [input, setInput] = useState('')

  const skills = value ? value.split(',').map(s => s.trim()).filter(Boolean) : []

  function add() {
    const val = input.trim().replace(/,+$/, '')
    if (val && !skills.includes(val)) {
      const next = [...skills, val].join(', ')
      onChange(next)
    }
    setInput('')
  }

  function remove(skill) {
    const next = skills.filter(s => s !== skill).join(', ')
    onChange(next)
  }

  function handleKey(e) {
    if (e.key === 'Enter') { e.preventDefault(); add() }
    if (e.key === ',')     { e.preventDefault(); add() }
  }

  return (
    <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200
      hover:border-slate-300 focus-within:ring-2 focus-within:ring-brand-400
      focus-within:border-brand-400 focus-within:bg-white transition-all min-h-[44px]">
      {skills.map(s => (
        <span key={s}
          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full
            bg-brand-50 text-brand-700 font-medium border border-brand-100">
          {s}
          <button type="button" onClick={() => remove(s)}
            className="hover:text-red-500 transition-colors">
            <X size={11} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={add}
        placeholder={skills.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[140px] bg-transparent text-sm outline-none placeholder:text-slate-400"
      />
    </div>
  )
}

export default function Profile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showPasswordFields, setShowPasswordFields] = useState(false)

  const [form, setForm] = useState({})
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')

  useEffect(() => {
    getProfile()
      .then(r => {
        const u = r.data.data.user
        setUser(u)
        setForm({
          name: u.name || '',
          headline: u.headline || '',
          bio: u.bio || '',
          location: u.location || '',
          website: u.website || '',
          availability: u.availability || 'available',
          skills_can_teach: u.skills_can_teach || '',
          skills_want_to_learn: u.skills_want_to_learn || '',
        })
      })
      .catch(err => toast.error(err.response?.data?.message || 'Failed to load profile.'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required.'); return }
    if (showPasswordFields) {
      if (!currentPassword) { toast.error('Current password is required.'); return }
      if (newPassword !== confirmPassword) { toast.error('Passwords do not match.'); return }
      if (newPassword && newPassword.length < 8) { toast.error('Password must be at least 8 characters.'); return }
    }

    setSaving(true)
    const payload = { ...form }
    if (showPasswordFields && newPassword) {
      payload.current_password = currentPassword
      payload.new_password = newPassword
      payload.new_password_confirmation = confirmPassword
    }

    try {
      const r = await updateProfile(payload)
      const updated = r.data.data.user
      setUser(updated)
      setEditing(false)
      setShowPasswordFields(false)
      setNewPassword('')
      setConfirmPassword('')
      setCurrentPassword('')
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    setShowPasswordFields(false)
    setNewPassword('')
    setConfirmPassword('')
    setCurrentPassword('')
    if (user) {
      setForm({
        name: user.name || '',
        headline: user.headline || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        availability: user.availability || 'available',
        skills_can_teach: user.skills_can_teach || '',
        skills_want_to_learn: user.skills_want_to_learn || '',
      })
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="h-28 skeleton rounded-none" />
          <div className="px-6 pb-6 -mt-12 relative">
            <div className="flex items-end gap-5">
              <div className="w-24 h-24 rounded-full skeleton border-4 border-white" />
              <div className="flex-1 space-y-3 pt-14">
                <div className="h-6 skeleton rounded w-48" />
                <div className="h-4 skeleton rounded w-64" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return <p className="text-red-500 text-center py-12">Failed to load profile.</p>

  const teachSkills = user.skills_can_teach ? user.skills_can_teach.split(',').map(s => s.trim()).filter(Boolean) : []
  const learnSkills = user.skills_want_to_learn ? user.skills_want_to_learn.split(',').map(s => s.trim()).filter(Boolean) : []

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        {editing ? (
          /* Edit mode */
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-display font-bold text-slate-900">Edit Profile</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <X size={14} /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-60 transition-colors font-medium"
                >
                  {saving
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Check size={14} />
                  }
                  Save Changes
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Headline</label>
                <input
                  type="text"
                  value={form.headline}
                  onChange={e => setForm(f => ({ ...f, headline: e.target.value }))}
                  placeholder="e.g. Full-stack Developer"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="City, Country"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Website</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                  placeholder="https://yoursite.com"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Bio</label>
              <textarea
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                rows={3}
                placeholder="Tell others about yourself…"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Availability</label>
              <div className="relative">
                <select
                  value={form.availability}
                  onChange={e => setForm(f => ({ ...f, availability: e.target.value }))}
                  className="w-full appearance-none rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 pr-8"
                >
                  {availabilityOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Skills inputs */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Skills I Can Teach</label>
              <SkillTagInput
                value={form.skills_can_teach}
                onChange={v => setForm(f => ({ ...f, skills_can_teach: v }))}
                placeholder="Type a skill, press Enter…"
              />
              <p className="text-xs text-slate-400 mt-1">Press Enter or comma to add each skill.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Skills I Want to Learn</label>
              <SkillTagInput
                value={form.skills_want_to_learn}
                onChange={v => setForm(f => ({ ...f, skills_want_to_learn: v }))}
                placeholder="Type a skill, press Enter…"
              />
              <p className="text-xs text-slate-400 mt-1">Press Enter or comma to add each skill.</p>
            </div>

            {/* Password section */}
            <div className="border-t border-slate-100 pt-4">
              <button
                onClick={() => setShowPasswordFields(p => !p)}
                className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
              >
                {showPasswordFields ? '− Hide password change' : '+ Change Password'}
              </button>
              {showPasswordFields && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Current Password *</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            {/* Gradient banner */}
            <div className={`h-28 relative ${
              user.role === 'student' ? 'bg-gradient-to-br from-student-400 via-student-500 to-brand-600'
                : user.role === 'employer' ? 'bg-gradient-to-br from-employer-400 via-employer-500 to-employer-700'
                : 'bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600'
            }`}>
              <div className="grid-pattern absolute inset-0" />
            </div>

            <div className="px-6 pb-6 -mt-12 relative">
              <div className="flex items-end gap-5">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 border-4 border-white shadow-lg ${
                  user.role === 'student' ? 'bg-student-500'
                    : user.role === 'employer' ? 'bg-employer-500'
                    : 'bg-amber-500'
                }`}>
                  {getInitials(user.name)}
                </div>
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-display font-bold text-slate-900">{user.name}</h2>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${roleBadge[user.role] || 'bg-slate-100 text-slate-600'}`}>
                          {user.role}
                        </span>
                      </div>
                      {user.headline && <p className="text-slate-600 mt-1 text-sm">{user.headline}</p>}
                    </div>
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors flex-shrink-0"
                    >
                      <Edit2 size={13} /> Edit Profile
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-3">
                    {user.location && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin size={12} /> {user.location}
                      </span>
                    )}
                    {user.website && (
                      <a
                        href={normalizeUrl(user.website)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-brand-600 hover:underline"
                      >
                        <Globe size={12} /> {user.website.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                    {user.availability && (
                      <span className="text-xs text-slate-500">
                        {availabilityOptions.find(o => o.value === user.availability)?.label || user.availability}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      Member since {new Date(user.created_at).toLocaleDateString([], { month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Bug 14: Bio with "About" section header */}
                  {user.bio && (
                    <div className="pt-4 border-t border-slate-100 mt-3">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">About</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{user.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Skills sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
          <h3 className="section-label !mb-3">Skills I Can Teach</h3>
          {teachSkills.length === 0 ? (
            <p className="text-xs text-slate-400">No skills listed yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {teachSkills.map((s, i) => (
                <span key={i} className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100 hover:bg-emerald-100 transition-colors">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
          <h3 className="section-label !mb-3">Skills I Want to Learn</h3>
          {learnSkills.length === 0 ? (
            <p className="text-xs text-slate-400">No skills listed yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {learnSkills.map((s, i) => (
                <span key={i} className="inline-flex items-center px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-medium border border-sky-100 hover:bg-sky-100 transition-colors">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
