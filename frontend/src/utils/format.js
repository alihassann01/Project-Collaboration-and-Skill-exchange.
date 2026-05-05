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
  student:  'bg-sky-100 text-sky-700',
  employer: 'bg-violet-100 text-violet-700',
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
