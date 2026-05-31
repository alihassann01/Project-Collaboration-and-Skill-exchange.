import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { X, Save, Trash2 } from 'lucide-react'
import { getProject, updateProject, deleteProject } from '../../api/projects'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Spinner from '../../components/ui/Spinner'

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

function validate(form) {
  const errs = {}
  if (!form.title.trim())                       errs.title       = 'Title is required.'
  if (!form.description.trim())                 errs.description = 'Description is required.'
  else if (form.description.trim().length < 50) errs.description = 'Description must be at least 50 characters.'
  if (!form.deadline)                           errs.deadline    = 'Deadline is required.'
  else if (new Date(form.deadline) < new Date(new Date().toDateString())) errs.deadline  = 'Deadline must be a future date.'
  const bMin = form.budget_min !== '' ? Number(form.budget_min) : null
  const bMax = form.budget_max !== '' ? Number(form.budget_max) : null
  if (bMin !== null && bMin < 0)                errs.budget_min  = 'Budget cannot be negative.'
  if (bMax !== null && bMax < 0)                errs.budget_max  = 'Budget cannot be negative.'
  if (bMin !== null && bMax !== null && bMax < bMin) errs.budget_max = 'Max budget must be ≥ min budget.'
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

export default function EditProject() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [form,    setForm]    = useState({
    title: '', description: '', deadline: '',
    budget_min: '', budget_max: '', type: '', duration: '',
  })
  const [skills,   setSkills]   = useState([])
  const [errors,   setErrors]   = useState({})
  const [loading,  setLoading]  = useState(false)
  const [fetching, setFetching] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  useEffect(() => {
    getProject(id)
      .then(res => {
        const p = res.data.data ?? res.data
        setForm({
          title:       p.title       ?? '',
          description: p.description ?? '',
          deadline:    p.deadline ? p.deadline.slice(0, 10) : '',
          budget_min:  p.budget_min != null ? String(p.budget_min) : '',
          budget_max:  p.budget_max != null ? String(p.budget_max) : '',
          type:        p.type     ?? '',
          duration:    p.duration ?? '',
        })
        const rawSkills = p.skills_required
        if (Array.isArray(rawSkills)) {
          setSkills(rawSkills)
        } else if (typeof rawSkills === 'string') {
          setSkills(rawSkills.split(',').map(s => s.trim()).filter(Boolean))
        }
      })
      .catch(err => {
        const msg = err.response?.data?.message || 'Failed to load project.'
        toast.error(msg)
      })
      .finally(() => setFetching(false))
  }, [id])

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length) return

    setLoading(true)
    try {
      await updateProject(id, {
        title:           form.title,
        description:     form.description,
        deadline:        form.deadline,
        skills_required: skills.join(', '),
        budget_min:      form.budget_min !== '' ? Number(form.budget_min) : null,
        budget_max:      form.budget_max !== '' ? Number(form.budget_max) : null,
        type:            form.type || null,
        duration:        form.duration || null,
      })
      toast.success('Project updated!')
      navigate(`/projects/${id}`)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update project.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteProject(id)
      toast.success('Project deleted.')
      navigate('/my-projects')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete project.'
      toast.error(msg)
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" className="text-brand-600" />
      </div>
    )
  }

  const selectClass = 'w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 focus:bg-white transition-all'

  return (
    <div className="animate-fade-up max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-900">Edit Project</h1>
        <p className="text-slate-500 text-sm mt-1">Update your project details below.</p>
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
              placeholder="Describe the project…"
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
                className={`${selectClass} ${errors.budget_min ? 'border-red-400 bg-red-50' : ''}`}
              />
              {errors.budget_min && <p className="text-xs text-red-500 font-medium">{errors.budget_min}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Budget Max (PKR) <span className="text-slate-400 font-normal">optional</span></label>
              <input
                type="number"
                min="0"
                value={form.budget_max}
                onChange={set('budget_max')}
                placeholder="e.g. 20000"
                className={`${selectClass} ${errors.budget_max ? 'border-red-400 bg-red-50' : ''}`}
              />
              {errors.budget_max && <p className="text-xs text-red-500 font-medium">{errors.budget_max}</p>}
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
              <Save size={15} /> Save Changes
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(`/projects/${id}`)}>
              Cancel
            </Button>
          </div>
        </form>

        {/* Delete zone */}
        <div className="mt-8 pt-6 border-t border-red-50">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Danger Zone</p>
          <Button
            variant="danger"
            loading={deleting}
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 size={15} /> Delete Project
          </Button>
          <p className="text-xs text-slate-400 mt-2">This cannot be undone.</p>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Project?"
        message="Are you sure you want to delete this project? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}
