import { useEffect, useState, useRef } from 'react'
import { getProfile, updateProfile, uploadAvatar } from '../../api/profile'
import { getInitials, roleBadge, availabilityOptions, chipColorClass } from '../../utils/format'
import toast from 'react-hot-toast'
import { MapPin, Globe, Edit2, X, Check, ChevronDown, Camera, Mail, UserRound, BookOpen, Target } from 'lucide-react'

// Bug 6: Normalize URLs without protocol
function normalizeUrl(url) {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return 'https://' + url
}

// Construct full avatar URL from the DB value (e.g. "avatars/3_1234567890.jpg")
function getAvatarUrl(avatar) {
  if (!avatar) return null
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar
  // Derive storage root: strip /api suffix from VITE_API_URL.
  const apiUrl = import.meta.env.VITE_API_URL || ''
  let storageBase = apiUrl ? apiUrl.replace(/\/api\/?$/, '') : ''
  if (!storageBase) {
    storageBase = window.location.port === '5173'
      ? 'http://localhost/skillmarket-pro'
      : `${window.location.origin}/skillmarket-pro`
  }
  return storageBase + '/storage/' + avatar
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

  // Avatar upload state
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef(null)

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
      let updated = r.data.data.user

      if (avatarFile) {
        const avatarUpdated = await uploadSelectedAvatar({ silent: true })
        updated = avatarUpdated || updated
      }

      setUser(updated)
      setEditing(false)
      setShowPasswordFields(false)
      setNewPassword('')
      setConfirmPassword('')
      setCurrentPassword('')
      toast.success(avatarFile ? 'Profile and photo updated!' : 'Profile updated!')
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
    setAvatarFile(null)
    setAvatarPreview(null)
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

  // Avatar file selection handler
  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side size check
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must not exceed 2MB.')
      e.target.value = ''
      return
    }

    // Client-side type check
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Allowed: JPEG, PNG, WebP, GIF.')
      e.target.value = ''
      return
    }

    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const uploadSelectedAvatar = async ({ silent = false } = {}) => {
    if (!avatarFile) return
    const formData = new FormData()
    formData.append('avatar', avatarFile)
    const r = await uploadAvatar(formData)
    const updated = r.data.data.user
    setUser(updated)
    setAvatarFile(null)
    setAvatarPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (!silent) toast.success('Photo updated!')
    return updated
  }

  // Avatar upload handler
  const handleAvatarUpload = async () => {
    setUploadingAvatar(true)
    try {
      await uploadSelectedAvatar()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photo.')
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Clean up object URL on unmount or change
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    }
  }, [avatarPreview])

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

  // Determine which avatar image to show
  const currentAvatarUrl = avatarPreview || getAvatarUrl(user.avatar)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
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

            {/* ─── Avatar Upload Section ─── */}
            <div className="flex flex-col items-center gap-3 pb-4 border-b border-slate-100">
              <div className="relative group">
                {/* Avatar circle */}
                {currentAvatarUrl ? (
                  <img
                    src={currentAvatarUrl}
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-slate-100"
                  />
                ) : (
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg ring-2 ring-slate-100 ${
                    user.role === 'student' ? 'bg-student-500'
                      : user.role === 'employer' ? 'bg-employer-500'
                      : 'bg-amber-500'
                  }`}>
                    {getInitials(user.name)}
                  </div>
                )}

                {/* Camera overlay button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-brand-500 text-white
                    flex items-center justify-center shadow-md border-2 border-white
                    hover:bg-brand-600 transition-all hover:scale-110 cursor-pointer"
                  title="Change photo"
                >
                  <Camera size={14} />
                </button>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
              </div>

              {/* Upload button — only visible after file selection */}
              {avatarFile && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 truncate max-w-[160px]">{avatarFile.name}</span>
                  <button
                    onClick={handleAvatarUpload}
                    disabled={uploadingAvatar || saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60 transition-colors font-medium"
                  >
                    {uploadingAvatar
                      ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <Check size={12} />
                    }
                    Upload now
                  </button>
                  <button
                    onClick={() => {
                      setAvatarFile(null)
                      setAvatarPreview(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <p className="text-xs text-slate-400">JPEG, PNG, WebP or GIF. Max 2MB. Save Changes also uploads the selected photo.</p>
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
            <div className="relative overflow-hidden bg-slate-950 px-6 py-7 text-white md:px-8 md:py-8">
              <div className="absolute inset-0 grid-pattern opacity-20" />
              <div className={`absolute inset-x-0 bottom-0 h-1 ${
                user.role === 'student' ? 'bg-student-500'
                  : user.role === 'employer' ? 'bg-employer-500'
                  : 'bg-amber-500'
              }`} />

              <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  {user.avatar ? (
                    <img
                      src={getAvatarUrl(user.avatar)}
                      alt={user.name}
                      className="h-28 w-28 rounded-2xl border-4 border-white/15 object-cover shadow-2xl ring-1 ring-white/20"
                    />
                  ) : (
                    <div className={`h-28 w-28 rounded-2xl border-4 border-white/15 flex items-center justify-center text-white text-4xl font-bold shadow-2xl ring-1 ring-white/20 ${
                      user.role === 'student' ? 'bg-student-500'
                        : user.role === 'employer' ? 'bg-employer-500'
                        : 'bg-amber-500'
                    }`}>
                      {getInitials(user.name)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-3xl font-bold leading-tight text-white">{user.name}</h2>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ring-white/15 ${roleBadge[user.role] || 'bg-white/10 text-white'}`}>
                        {user.role}
                      </span>
                    </div>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/72">
                      {user.headline || (user.role === 'student' ? 'Student on SkillMarket Pro' : 'SkillMarket Pro member')}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {user.availability && (
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/85 ring-1 ring-white/10">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.18)]" />
                          {availabilityOptions.find(o => o.value === user.availability)?.label || user.availability}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/85 ring-1 ring-white/10">
                        <UserRound size={13} /> Member since {new Date(user.created_at).toLocaleDateString([], { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white px-4 py-2.5 text-sm font-bold text-slate-950 shadow-sm transition-colors hover:bg-slate-100"
                >
                  <Edit2 size={15} /> Edit Profile
                </button>
              </div>
            </div>

            <div className="grid gap-0 border-t border-slate-100 md:grid-cols-[0.82fr_1.18fr]">
              <aside className="border-b border-slate-100 bg-slate-50/70 p-6 md:border-b-0 md:border-r">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Contact</p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 rounded-xl bg-white px-3 py-3 text-sm text-slate-700 ring-1 ring-slate-100">
                    <Mail size={15} className="text-slate-400" />
                    <span className="min-w-0 truncate">{user.email}</span>
                  </div>
                  {user.location && (
                    <div className="flex items-center gap-3 rounded-xl bg-white px-3 py-3 text-sm text-slate-700 ring-1 ring-slate-100">
                      <MapPin size={15} className="text-slate-400" />
                      <span className="min-w-0 truncate">{user.location}</span>
                    </div>
                  )}
                  {user.website && (
                    <a
                      href={normalizeUrl(user.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl bg-white px-3 py-3 text-sm font-semibold text-brand-700 ring-1 ring-slate-100 transition-colors hover:bg-brand-50"
                    >
                      <Globe size={15} />
                      <span className="min-w-0 truncate">{user.website.replace(/^https?:\/\//, '')}</span>
                    </a>
                  )}
                </div>
              </aside>

              <section className="p-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <BookOpen size={17} />
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900">About</h3>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {user.bio || 'No bio added yet. Add a short intro so people understand your work, goals, and collaboration style.'}
                </p>
              </section>
            </div>
          </div>
        )}
      </div>

      {/* Skills sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <BookOpen size={18} />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-900">Skills I Can Teach</h3>
              <p className="text-xs text-slate-400">Strengths others can learn from</p>
            </div>
          </div>
          {teachSkills.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-400">No skills listed yet.</div>
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
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
              <Target size={18} />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-900">Skills I Want to Learn</h3>
              <p className="text-xs text-slate-400">Growth areas and interests</p>
            </div>
          </div>
          {learnSkills.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-400">No skills listed yet.</div>
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
