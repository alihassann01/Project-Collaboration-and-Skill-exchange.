import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getPublicProfile } from '../../api/profile'
import { getUserRatings, submitRating } from '../../api/ratings'
import { startConversation } from '../../api/messages'
import { useAuth } from '../../context/AuthContext'
import { getInitials, colorFor, roleBadge, availabilityOptions, chipColorClass } from '../../utils/format'
import toast from 'react-hot-toast'
import { MapPin, Globe, MessageSquare, Star, Send } from 'lucide-react'

// Bug 6: Normalize URLs without protocol
function normalizeUrl(url) {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return 'https://' + url
}

// Construct full avatar URL from the DB value
function getAvatarUrl(avatar) {
  if (!avatar) return null
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar
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

// Render filled/empty stars
function StarRating({ score, max = 5 }) {
  return (
    <span className="text-amber-400 text-base" aria-label={`${score} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i}>{i < Math.round(score) ? '★' : '☆'}</span>
      ))}
    </span>
  )
}

// Interactive star picker for submitting ratings
function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const star = i + 1
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="text-2xl transition-transform hover:scale-110"
          >
            <span className={star <= (hover || value) ? 'text-amber-400' : 'text-slate-300'}>
              ★
            </span>
          </button>
        )
      })}
    </div>
  )
}

function RatingsSection({ userId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUserRatings(userId)
      .then(res => setData(res.data.data))
      .catch(() => setData({ ratings: [], average_score: 0, total: 0 }))
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 animate-pulse space-y-3">
        <div className="h-4 bg-slate-200 rounded w-40" />
        <div className="h-3 bg-slate-100 rounded w-64" />
        <div className="h-3 bg-slate-100 rounded w-56" />
      </div>
    )
  }

  const { ratings = [], average_score = 0, total = 0 } = data ?? {}

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-1">Ratings &amp; Reviews</h3>
        {total > 0 ? (
          <div className="flex items-center gap-2">
            <StarRating score={average_score} />
            <span className="text-sm font-semibold text-slate-800">{average_score} / 5</span>
            <span className="text-xs text-slate-400">({total} {total === 1 ? 'review' : 'reviews'})</span>
          </div>
        ) : (
          <p className="text-xs text-slate-400">No reviews yet.</p>
        )}
      </div>

      {ratings.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-slate-100">
          {ratings.map((r, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700">{r.from_user_name}</span>
                  <StarRating score={r.score} />
                </div>
                <span className="text-xs text-slate-400">
                  {r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                </span>
              </div>
              {r.project_title && (
                <p className="text-xs text-slate-400">Project: {r.project_title}</p>
              )}
              {r.review && (
                <p className="text-sm text-slate-600 leading-relaxed">{r.review}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Rating submission form
function SubmitRatingForm({ userId, projectId = 0, onSubmitted }) {
  const [score, setScore] = useState(0)
  const [review, setReview] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (score < 1) { toast.error('Please select a star rating.'); return }
    setSubmitting(true)
    try {
      await submitRating(userId, projectId, { score, review: review.trim() || null })
      toast.success('Review submitted!')
      setScore(0)
      setReview('')
      onSubmitted?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
      <h3 className="text-sm font-semibold text-slate-700">Leave a Review</h3>
      <p className="text-xs text-slate-400 -mt-2">You can only rate users you've collaborated with on a project or skill swap.</p>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-2">Your Rating</label>
        <StarPicker value={score} onChange={setScore} />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Review (optional)</label>
        <textarea
          value={review}
          onChange={e => setReview(e.target.value)}
          rows={3}
          placeholder="Share your experience working with this person…"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 resize-none"
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={score < 1 || submitting}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {submitting
          ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          : <Send size={14} />
        }
        Submit Review
      </button>
    </div>
  )
}

export default function PublicProfile() {
  const { id } = useParams()
  const { user: me } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [startingChat, setStartingChat] = useState(false)
  const [ratingKey, setRatingKey] = useState(0) // force re-render of ratings

  useEffect(() => {
    if (me && String(me.id) === String(id)) {
      navigate('/profile', { replace: true })
      return
    }
    getPublicProfile(id)
      .then(r => setProfile(r.data.data.user))
      .catch(err => {
        const msg = err.response?.data?.message || 'Failed to load profile.'
        setError(msg)
        toast.error(msg)
      })
      .finally(() => setLoading(false))
  }, [id, me, navigate])

  const handleMessage = async () => {
    if (startingChat) return
    setStartingChat(true)
    try {
      const r = await startConversation(profile.id)
      const convId = r.data.data.conversation_id
      navigate(`/messages/${convId}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start conversation.')
    } finally {
      setStartingChat(false)
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

  if (error || !profile) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-red-500 text-sm">{error || 'User not found.'}</p>
        <button onClick={() => navigate(-1)} className="text-sm text-brand-600 hover:underline">Go back</button>
      </div>
    )
  }

  const teachSkills = profile.skills_can_teach ? profile.skills_can_teach.split(',').map(s => s.trim()).filter(Boolean) : []
  const learnSkills = profile.skills_want_to_learn ? profile.skills_want_to_learn.split(',').map(s => s.trim()).filter(Boolean) : []

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        {/* Gradient Banner */}
        <div className={`h-28 relative ${
          profile.role === 'student' ? 'bg-gradient-to-br from-student-400 via-student-500 to-brand-600'
            : profile.role === 'employer' ? 'bg-gradient-to-br from-employer-400 via-employer-500 to-employer-700'
            : 'bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600'
        }`}>
          <div className="grid-pattern absolute inset-0" />
        </div>

        <div className="px-6 pb-6 -mt-12 relative">
          <div className="flex items-end gap-5">
            {/* Avatar: show real image if available, else initials circle */}
            {profile.avatar ? (
              <img
                src={getAvatarUrl(profile.avatar)}
                alt={profile.name}
                className="w-24 h-24 rounded-full object-cover flex-shrink-0 border-4 border-white shadow-lg"
              />
            ) : (
              <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 border-4 border-white shadow-lg ${
                profile.role === 'student' ? 'bg-student-500'
                  : profile.role === 'employer' ? 'bg-employer-500'
                  : 'bg-amber-500'
              }`}>
                {getInitials(profile.name)}
              </div>
            )}
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-display font-bold text-slate-900">{profile.name}</h2>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${roleBadge[profile.role] || 'bg-slate-100 text-slate-600'}`}>
                      {profile.role}
                    </span>
                  </div>
                  {profile.headline && <p className="text-slate-600 mt-1 text-sm">{profile.headline}</p>}
                </div>
                {me ? (
                  <button
                    onClick={handleMessage}
                    disabled={startingChat}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-white disabled:opacity-60 transition-all flex-shrink-0 font-semibold shadow-sm ${
                      profile.role === 'student'
                        ? 'bg-gradient-to-r from-student-500 to-student-600 hover:from-student-600 hover:to-student-700'
                        : profile.role === 'employer'
                        ? 'bg-gradient-to-r from-employer-500 to-employer-600 hover:from-employer-600 hover:to-employer-700'
                        : 'bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800'
                    }`}
                  >
                    {startingChat
                      ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <MessageSquare size={14} />
                    }
                    Message
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-white bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 transition-all flex-shrink-0 font-semibold shadow-sm"
                  >
                    <MessageSquare size={14} />
                    Login to Message
                  </Link>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mt-3">
                {profile.location && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin size={12} /> {profile.location}
                  </span>
                )}
                {profile.website && (
                  <a
                    href={normalizeUrl(profile.website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-brand-600 hover:underline"
                  >
                    <Globe size={12} /> {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
                {profile.availability && (
                  <span className="text-xs text-slate-500">
                    {availabilityOptions.find(o => o.value === profile.availability)?.label || profile.availability}
                  </span>
                )}
                <span className="text-xs text-slate-400">
                  Member since {new Date(profile.created_at).toLocaleDateString([], { month: 'short', year: 'numeric' })}
                </span>
              </div>

              {profile.bio && (
                <div className="pt-4 border-t border-slate-100 mt-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">About</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{profile.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
          <h3 className="section-label !mb-3">Skills They Can Teach</h3>
          {teachSkills.length === 0 ? (
            <p className="text-xs text-slate-400">No skills listed yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {teachSkills.map((s, i) => (
                <span key={i} className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
          <h3 className="section-label !mb-3">Skills They Want to Learn</h3>
          {learnSkills.length === 0 ? (
            <p className="text-xs text-slate-400">No skills listed yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {learnSkills.map((s, i) => (
                <span key={i} className="inline-flex items-center px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-medium border border-sky-100">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ratings & Reviews */}
      <RatingsSection key={ratingKey} userId={id} />

      {/* Submit Rating */}
      {me && (
        <SubmitRatingForm
          userId={id}
          onSubmitted={() => setRatingKey(k => k + 1)}
        />
      )}
    </div>
  )
}
