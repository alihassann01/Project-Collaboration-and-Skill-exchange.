import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { X, Plus } from 'lucide-react'
import { createProject } from '../../api/projects'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

function SkillTagInput({ skills, onAdd, onRemove }) {
  const [input, setInput] = useState('')

  function add() {
    const val = input.trim().replace(/,+$/, '')
    if (val && !skills.includes(val)) onAdd(val)
    setInput('')
  }

  function handleKey(e) {
    if (e.key === 'Enter') { e.preventDefault(); add() }
    if (e.key === ',')     { e.preventDefault(); add() }
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700">Skills Required</label>
      <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200
        hover:border-slate-300 focus-within:ring-2 focus-within:ring-brand-400
        focus-within:border-brand-400 focus-within:bg-white transition-all min-h-[44px]">
        {skills.map(s => (
          <span key={s}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full
              bg-brand-50 text-brand-700 font-medium border border-brand-100">
            {s}
            <button type="button" onClick={() => onRemove(s)}
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
          placeholder={skills.length === 0 ? 'Type a skill, press Enter or comma…' : ''}
          className="flex-1 min-w-[140px] bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </div>
      <p className="text-xs text-slate-400">Press Enter or comma to add each skill.</p>
    </div>
  )
}

function validate(form, skills) {
  const errs = {}
  if (!form.title.trim())                     errs.title       = 'Title is required.'
  if (!form.description.trim())               errs.description = 'Description is required.'
  else if (form.description.trim().length < 50) errs.description = 'Description must be at least 50 characters.'
  if (!form.deadline)                         errs.deadline    = 'Deadline is required.'
  else if (new Date(form.deadline) <= new Date()) errs.deadline = 'Deadline must be a future date.'
  return errs
}

const TYPE_OPTIONS = [
  { value: '', label: 'Select type (optional)' },
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'Onsite' },
  { value: 'hybrid', label: 'Hybrid' },
]

const DURATION_OPTIONS = [
  { value: '', label: 'Select duration (optional)' },
  { value: 'less_1_month', label: 'Less than 1 month' },
  { value: '1_3_months', label: '1–3 months' },
  { value: '3_6_months', label: '3–6 months' },
  { value: 'ongoing', label: 'Ongoing' },
]

export default function CreateProject() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '', description: '', deadline: '',
    budget_min: '', budget_max: '', type: '', duration: '',
  })
  const [skills, setSkills] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate(form, skills)
    setErrors(errs)
    if (Object.keys(errs).length) return

    setLoading(true)
    try {
      await createProject({
        title:           form.title,
        description:     form.description,
        deadline:        form.deadline,
        skills_required: skills.join(', '),
        budget_min:      form.budget_min !== '' ? Number(form.budget_min) : undefined,
        budget_max:      form.budget_max !== '' ? Number(form.budget_max) : undefined,
        type:            form.type || undefined,
        duration:        form.duration || undefined,
      })
      toast.success('Project created!')
      navigate('/my-projects')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create project.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const selectClass = 'w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 focus:bg-white transition-all'

  return (
    <div className="animate-fade-up max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-700 text-slate-900">Post a New Project</h1>
        <p className="text-slate-500 text-sm mt-1">Fill in the details to find the right students.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Input
            label="Project Title"
            name="title"
            placeholder="e.g. Build a Portfolio Website"
            value={form.title}
            onChange={set('title')}
            error={errors.title}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea
              rows={6}
              value={form.description}
              onChange={set('description')}
              placeholder="Describe the project, requirements, and what students will learn…"
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border transition-all
                placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400
                focus:border-brand-400 focus:bg-white resize-y
                ${errors.description ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-slate-300'}`}
            />
            {errors.description && <p className="text-xs text-red-500 font-medium">{errors.description}</p>}
            <p className="text-xs text-slate-400">{form.description.length} chars (min 50)</p>
          </div>

          <SkillTagInput
            skills={skills}
            onAdd={s => setSkills(prev => [...prev, s])}
            onRemove={s => setSkills(prev => prev.filter(x => x !== s))}
          />

          <Input
            label="Deadline"
            type="date"
            name="deadline"
            value={form.deadline}
            onChange={set('deadline')}
            error={errors.deadline}
          />

          {/* Budget */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Budget Min (PKR) <span className="text-slate-400 font-normal">optional</span></label>
              <input
                type="number"
                min="0"
                value={form.budget_min}
                onChange={set('budget_min')}
                placeholder="e.g. 5000"
                className={selectClass}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Budget Max (PKR) <span className="text-slate-400 font-normal">optional</span></label>
              <input
                type="number"
                min="0"
                value={form.budget_max}
                onChange={set('budget_max')}
                placeholder="e.g. 20000"
                className={selectClass}
              />
            </div>
          </div>

          {/* Type & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Project Type <span className="text-slate-400 font-normal">optional</span></label>
              <select value={form.type} onChange={set('type')} className={selectClass}>
                {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Duration <span className="text-slate-400 font-normal">optional</span></label>
              <select value={form.duration} onChange={set('duration')} className={selectClass}>
                {DURATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" loading={loading}>
              <Plus size={15} /> Create Project
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
