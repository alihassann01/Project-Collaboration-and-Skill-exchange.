/**
 * Shared formatting utilities
 */

export function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export const avatarColors = [
  'bg-brand-500', 'bg-violet-500', 'bg-teal-500', 'bg-amber-500', 'bg-rose-500',
]

export function colorFor(id) {
  return avatarColors[(id || 0) % avatarColors.length]
}

export const roleBadge = {
  student:  'bg-emerald-100 text-emerald-700',
  employer: 'bg-indigo-100 text-indigo-700',
  admin:    'bg-amber-100 text-amber-700',
}

export const roleLabel = {
  student:  'Student',
  employer: 'Employer',
  admin:    'Admin',
}

export const availabilityOptions = [
  { value: 'available', label: '🟢 Available' },
  { value: 'busy', label: '🟡 Busy' },
  { value: 'unavailable', label: '🔴 Not Available' },
]

// ─── Budget Formatter ──────────────────────────────────────────────────────
export function formatBudget(amount) {
  if (amount == null || amount === '') return null
  const n = Number(amount)
  if (isNaN(n)) return null
  if (n >= 1000000) return `${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`
  return n.toString()
}

export function formatBudgetRange(min, max) {
  const fMin = formatBudget(min)
  const fMax = formatBudget(max)
  if (fMin && fMax) return `PKR ${fMin} – ${fMax}`
  if (fMin) return `PKR ${fMin}+`
  if (fMax) return `Up to PKR ${fMax}`
  return null
}

// ─── Chip Color Cycling ────────────────────────────────────────────────────
const CHIP_COLORS = ['blue', 'green', 'purple', 'orange', 'pink', 'teal', 'rose', 'sky', 'amber', 'indigo']

export function chipColorClass(index) {
  return `tag-chip tag-chip-${CHIP_COLORS[index % CHIP_COLORS.length]}`
}

// ─── Deadline Urgency ──────────────────────────────────────────────────────
export function deadlineUrgency(deadline) {
  if (!deadline) return null
  const now = new Date()
  const dl = new Date(deadline)
  const diffMs = dl - now
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { label: 'Expired', color: 'bg-slate-100 text-slate-500', icon: '⏹', urgent: false }
  if (diffDays === 0) return { label: 'Today!', color: 'bg-red-100 text-red-700', icon: '🔴', urgent: true }
  if (diffDays <= 3) return { label: `${diffDays}d left`, color: 'bg-red-100 text-red-700', icon: '🔴', urgent: true }
  if (diffDays <= 7) return { label: `${diffDays}d left`, color: 'bg-orange-100 text-orange-700', icon: '🟠', urgent: true }
  if (diffDays <= 14) return { label: `${diffDays}d left`, color: 'bg-yellow-100 text-yellow-700', icon: '🟡', urgent: false }
  return { label: 'Open', color: 'bg-emerald-100 text-emerald-700', icon: '🟢', urgent: false }
}

// ─── Duration Labels ───────────────────────────────────────────────────────
export const durationLabels = {
  less_1_month: '< 1 month',
  '1_3_months': '1–3 months',
  '3_6_months': '3–6 months',
  ongoing: 'Ongoing',
}

// ─── Type Labels ───────────────────────────────────────────────────────────
export const typeLabels = {
  remote: { label: 'Remote', icon: '🌐' },
  onsite: { label: 'On-site', icon: '🏢' },
  hybrid: { label: 'Hybrid', icon: '🔀' },
}

// ─── Role Avatar Colors ───────────────────────────────────────────────────
export const roleAvatarBg = {
  student:  'bg-student-500',
  employer: 'bg-employer-500',
  admin:    'bg-amber-500',
}
