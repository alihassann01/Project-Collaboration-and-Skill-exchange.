import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { CalendarDays, Users, Edit, CheckCircle, Eye, Briefcase, ArrowLeft, Clock, Send, Video, ExternalLink, Save, Upload, Download, RotateCcw, AlertCircle, Wallet, CreditCard, Landmark } from 'lucide-react'
import {
  getProject,
  applyToProject,
  getApplications,
  updateAppStatus,
  updateMeetingLink,
  deliverProject,
  downloadDelivery,
  startProjectReview,
  decideProjectDelivery,
  savePaymentDetails,
  submitProjectPayment,
  downloadPaymentReceipt,
  confirmProjectPayment,
  disputeProjectPayment,
} from '../../api/projects'
import { useAuth } from '../../context/AuthContext'
import { getInitials, chipColorClass, formatBudgetRange, deadlineUrgency, typeLabels, durationLabels } from '../../utils/format'
import StatusBadge from '../../components/ui/StatusBadge'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'

const pakistanBanks = [
  'Al Baraka Bank Pakistan',
  'Allied Bank Limited',
  'Askari Bank',
  'Bank Alfalah',
  'Bank Al Habib',
  'Bank of China Pakistan',
  'BankIslami Pakistan',
  'Bank of Khyber',
  'Bank of Punjab',
  'Citibank Pakistan',
  'Deutsche Bank Pakistan',
  'Dubai Islamic Bank Pakistan',
  'Faysal Bank',
  'First Women Bank',
  'Habib Bank Limited',
  'Habib Metropolitan Bank',
  'Industrial and Commercial Bank of China Pakistan',
  'JS Bank',
  'MCB Bank',
  'MCB Islamic Bank',
  'Meezan Bank',
  'National Bank of Pakistan',
  'Samba Bank',
  'Silkbank',
  'SME Bank',
  'Sindh Bank',
  'Soneri Bank',
  'Standard Chartered Bank Pakistan',
  'Summit Bank',
  'The Punjab Provincial Cooperative Bank',
  'United Bank Limited',
  'Zarai Taraqiati Bank Limited',
]

const paymentMethodLabels = {
  easypaisa: 'Easypaisa',
  jazzcash: 'JazzCash',
  bank: 'Bank transfer',
}

function SkeletonDetail() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="h-4 skeleton w-32" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="h-8 skeleton w-3/4" />
          <div className="h-4 skeleton w-1/3" />
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-3 skeleton" style={{ width: `${90 - i * 10}%` }} />)}
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-10 skeleton" />)}
          </div>
          <div className="h-12 skeleton rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

// ─── Apply form ────────────────────────────────────────────────────────────
function ApplyForm({ projectId, onSuccess }) {
  const [coverLetter, setCoverLetter] = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (coverLetter.trim().length < 50) {
      setError('Cover letter must be at least 50 characters.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await applyToProject(projectId, { cover_letter: coverLetter.trim() })
      toast.success('Application submitted!')
      onSuccess()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit application.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 border-t border-slate-100 pt-4 space-y-3">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Cover Letter</label>
        <textarea
          rows={5}
          value={coverLetter}
          onChange={e => setCoverLetter(e.target.value)}
          placeholder="Tell us why you're a good fit…"
          className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border transition-all
            placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400
            focus:border-brand-400 focus:bg-white resize-none
            ${error ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-slate-300'}`}
        />
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        <p className={`text-xs font-medium ${coverLetter.length >= 50 ? 'text-green-500' : 'text-slate-400'}`}>
          {coverLetter.length} / 50 chars min {coverLetter.length >= 50 && '✓'}
        </p>
      </div>
      <Button type="submit" variant="student" loading={loading} className="w-full">
        <Send size={14} /> Submit Application
      </Button>
    </form>
  )
}

// ─── Applications table (employer) ─────────────────────────────────────────
function ApplicationsSection({ projectId }) {
  const [apps, setApps]       = useState([])
  const [loading, setLoading] = useState(true)
  const [savingMeeting, setSavingMeeting] = useState(null)

  useEffect(() => {
    getApplications(projectId)
      .then(res => setApps(res.data.data ?? res.data ?? []))
      .catch(err => {
        const msg = err.response?.data?.message || 'Failed to load applications.'
        toast.error(msg)
      })
      .finally(() => setLoading(false))
  }, [projectId])

  async function handleStatus(appId, status) {
    // Fix 12: Capture the real original status before the optimistic update,
    // so we can restore it correctly on failure instead of hardcoding 'pending'.
    const originalApp = apps.find(a => a.id === appId)
    const originalStatus = originalApp?.status || 'pending'

    setApps(prev => prev.map(a => a.id === appId ? { ...a, status } : a))
    try {
      await updateAppStatus(appId, status)
      toast.success(`Application ${status}.`)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update status.'
      toast.error(msg)
      setApps(prev => prev.map(a => a.id === appId ? { ...a, status: originalStatus } : a))
    }
  }

  async function handleMeeting(appId, meetingLink) {
    setSavingMeeting(appId)
    try {
      const res = await updateMeetingLink(appId, meetingLink)
      const updated = res.data.data
      setApps(prev => prev.map(a => a.id === appId ? { ...a, meeting_link: updated.meeting_link } : a))
      toast.success(res.data.message || 'Meeting link saved.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save meeting link.')
    } finally {
      setSavingMeeting(null)
    }
  }

  if (loading) return (
    <div className="flex justify-center py-8">
      <Spinner size="md" className="text-brand-600" />
    </div>
  )

  return (
    <div id="applications-anchor" className="mt-10">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="font-display font-bold text-slate-900 text-lg">Applications</h2>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-600">
          {apps.length}
        </span>
      </div>
      {apps.length === 0 ? (
        <div className="empty-state bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Users size={40} className="empty-state-icon" />
          <p className="empty-state-title">No applications yet</p>
          <p className="empty-state-text">Applications will appear here once students apply.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-3 text-left">Student</th>
                  <th className="px-6 py-3 text-left">Applied On</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {apps.map(app => {
                  const studentId = app.student_id ?? app.user?.id
                  const studentName = app.student_name ?? app.user?.name ?? '—'
                  return (
                    <tr key={app.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 font-medium text-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-student-400 to-student-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                            {getInitials(studentName)}
                          </div>
                          {studentId ? (
                            <Link
                              to={`/profile/${studentId}`}
                              className="text-brand-600 hover:text-brand-700 hover:underline transition-colors font-semibold text-sm"
                            >
                              {studentName}
                            </Link>
                          ) : <span className="text-sm">{studentName}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-slate-500 text-xs">
                        {app.created_at ? new Date(app.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex flex-col gap-2">
                          {app.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleStatus(app.id, 'approved')}
                                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700
                                  hover:bg-emerald-100 transition-colors border border-emerald-200"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatus(app.id, 'rejected')}
                                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600
                                  hover:bg-red-100 transition-colors border border-red-200"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {app.status === 'approved' && (
                            <form
                              onSubmit={e => {
                                e.preventDefault()
                                handleMeeting(app.id, e.currentTarget.elements.meeting_link.value)
                              }}
                              className="flex flex-wrap items-center gap-2"
                            >
                              <div className="relative">
                                <Video size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                  name="meeting_link"
                                  defaultValue={app.meeting_link || ''}
                                  placeholder="Zoom/meeting link"
                                  className="w-48 pl-8 pr-2 py-1.5 rounded-lg text-xs border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-300"
                                />
                              </div>
                              <button
                                type="submit"
                                disabled={savingMeeting === app.id}
                                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 disabled:opacity-50"
                              >
                                <Save size={12} /> Save
                              </button>
                              {app.meeting_link && (
                                <a
                                  href={app.meeting_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                >
                                  <ExternalLink size={12} /> Join
                                </a>
                              )}
                            </form>
                          )}
                        </div>
                        {false && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleStatus(app.id, 'approved')}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700
                                hover:bg-emerald-100 transition-colors border border-emerald-200"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => handleStatus(app.id, 'rejected')}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600
                                hover:bg-red-100 transition-colors border border-red-200"
                            >
                              ✕ Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────
function ProjectDeliveryPanel({
  project,
  isOwner,
  isHiredStudent,
  deliveryFile,
  setDeliveryFile,
  uploadingDelivery,
  onDeliver,
  downloadingDelivery,
  onDownload,
  startingReview,
  onStartReview,
  decidingDelivery,
  onDecision,
}) {
  const canStudentDeliver = isHiredStudent && ['in_progress', 'revision_requested'].includes(project.status)
  const hasDelivery = Boolean(project.delivery_file_path)
  const deliveredAt = project.delivered_at
    ? new Date(project.delivered_at).toLocaleString()
    : null

  if (!isOwner && !isHiredStudent) return null
  if (!canStudentDeliver && !hasDelivery && !['delivered', 'reviewing', 'revision_requested', 'completed'].includes(project.status)) return null

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center flex-shrink-0">
          <Upload size={17} />
        </div>
        <div>
          <h3 className="font-display font-bold text-slate-900">Project Delivery</h3>
          <p className="text-xs text-slate-500 mt-0.5">Upload, review, approve, or request changes.</p>
        </div>
      </div>

      {project.status === 'revision_requested' && project.revision_note && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">
          <div className="flex items-center gap-2 font-semibold mb-1">
            <AlertCircle size={14} /> Revision requested
          </div>
          {project.revision_note}
        </div>
      )}

      {hasDelivery && (
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
          <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Latest ZIP</p>
          <p className="mt-1 text-sm font-semibold text-slate-800 break-all">
            {project.delivery_original_name || 'project-delivery.zip'}
          </p>
          {deliveredAt && <p className="text-xs text-slate-400 mt-1">Delivered {deliveredAt}</p>}
          <Button variant="secondary" size="sm" className="mt-3 w-full" loading={downloadingDelivery} onClick={onDownload}>
            <Download size={14} /> Download ZIP
          </Button>
        </div>
      )}

      {canStudentDeliver && (
        <form onSubmit={onDeliver} className="space-y-3">
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Attach ZIP file</span>
            <input
              type="file"
              accept=".zip,application/zip,application/x-zip-compressed"
              onChange={e => setDeliveryFile(e.target.files?.[0] || null)}
              className="mt-2 w-full text-sm text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-student-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-student-700 hover:file:bg-student-100"
            />
          </label>
          <Button type="submit" variant="student" className="w-full" loading={uploadingDelivery} disabled={!deliveryFile}>
            <Upload size={15} /> {project.status === 'revision_requested' ? 'Upload Revised ZIP' : 'Deliver Project'}
          </Button>
        </form>
      )}

      {isHiredStudent && project.status === 'delivered' && (
        <div className="rounded-xl bg-violet-50 border border-violet-100 p-3 text-sm font-semibold text-violet-700">
          Delivery sent. Waiting for employer to start review.
        </div>
      )}
      {isHiredStudent && project.status === 'reviewing' && (
        <div className="rounded-xl bg-sky-50 border border-sky-100 p-3 text-sm font-semibold text-sky-700">
          Employer is reviewing your delivery.
        </div>
      )}
      {isHiredStudent && project.status === 'completed' && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-sm font-semibold text-emerald-700">
          Delivery approved. Project completed.
        </div>
      )}

      {isOwner && project.status === 'delivered' && (
        <Button variant="employer" className="w-full" loading={startingReview} onClick={onStartReview}>
          <Eye size={15} /> Start Review
        </Button>
      )}

      {isOwner && project.status === 'reviewing' && (
        <div className="grid gap-2">
          <Button variant="success" className="w-full" loading={decidingDelivery === 'approved'} onClick={() => onDecision('approved')}>
            <CheckCircle size={15} /> Approve Delivery
          </Button>
          <Button variant="secondary" className="w-full" loading={decidingDelivery === 'rejected'} onClick={() => onDecision('rejected')}>
            <RotateCcw size={15} /> Request Changes
          </Button>
        </div>
      )}
    </div>
  )
}

function ProjectPaymentPanel({
  project,
  isOwner,
  isHiredStudent,
  paymentDetailsForm,
  setPaymentDetailsForm,
  savingPaymentDetails,
  onSavePaymentDetails,
  paymentForm,
  setPaymentForm,
  paymentReceipt,
  setPaymentReceipt,
  submittingPayment,
  onSubmitPayment,
  downloadingReceipt,
  onDownloadReceipt,
  confirmingPayment,
  onConfirmPayment,
  disputingPayment,
  onDisputePayment,
}) {
  const payment = project.latest_payment
  const details = project.payment_details
  const canStudentAddDetails = isHiredStudent && project.status === 'completed' && !details
  const canEmployerPay = isOwner && project.status === 'completed' && details && (!payment || payment.status === 'disputed')

  if (!canStudentAddDetails && !isOwner && !payment) return null

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
          <Wallet size={17} />
        </div>
        <div>
          <h3 className="font-display font-bold text-slate-900">Project Payment</h3>
          <p className="text-xs text-slate-500 mt-0.5">Manual Easypaisa, JazzCash, or bank transfer after approval.</p>
        </div>
      </div>

      {payment && (
        <div className={`rounded-xl border p-3 ${
          payment.status === 'confirmed'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : payment.status === 'disputed'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-amber-200 bg-amber-50 text-amber-800'
        }`}>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold capitalize">{payment.status.replace('_', ' ')}</p>
            <p className="text-sm font-bold">PKR {Number(payment.amount || 0).toLocaleString()}</p>
          </div>
          <p className="mt-1 text-xs">Ref: {payment.transaction_reference}</p>
          {payment.dispute_note && <p className="mt-2 text-xs font-medium">Issue: {payment.dispute_note}</p>}
          <Button variant="secondary" size="sm" className="mt-3 w-full" loading={downloadingReceipt} onClick={() => onDownloadReceipt(payment)}>
            <Download size={14} /> Download Receipt
          </Button>
        </div>
      )}

      {isHiredStudent && project.status === 'completed' && !details && (
        <div className="rounded-xl border border-sky-100 bg-sky-50 p-3 text-sm text-sky-700">
          Your project was approved. Add receiving details so the employer can pay you.
        </div>
      )}

      {isHiredStudent && details && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-800">
          <p className="font-bold">Payment details locked</p>
          <p className="mt-1 text-xs leading-relaxed">Your receiving details were saved for this project and cannot be changed now.</p>
        </div>
      )}

      {canStudentAddDetails && (
        <form onSubmit={onSavePaymentDetails} className="space-y-3">
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Payment option</span>
            <select
              value={paymentDetailsForm.method}
              onChange={e => setPaymentDetailsForm(f => ({ ...f, method: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-300"
            >
              <option value="easypaisa">Easypaisa</option>
              <option value="jazzcash">JazzCash</option>
              <option value="bank">Other Bank Account</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Account title</span>
            <input
              value={paymentDetailsForm.account_title}
              onChange={e => setPaymentDetailsForm(f => ({ ...f, account_title: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-300"
              placeholder="Account holder name"
            />
          </label>
          {paymentDetailsForm.method === 'bank' ? (
            <>
              <label className="block">
                <span className="text-xs font-semibold text-slate-600">Bank</span>
                <select
                  value={paymentDetailsForm.bank_name}
                  onChange={e => setPaymentDetailsForm(f => ({ ...f, bank_name: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-300"
                >
                  <option value="">Select bank</option>
                  {pakistanBanks.map(bank => <option key={bank} value={bank}>{bank}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-600">Account number</span>
                <input
                  value={paymentDetailsForm.account_number}
                  onChange={e => setPaymentDetailsForm(f => ({ ...f, account_number: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-300"
                  placeholder="Account number"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-600">IBAN</span>
                <input
                  value={paymentDetailsForm.iban}
                  onChange={e => setPaymentDetailsForm(f => ({ ...f, iban: e.target.value.toUpperCase() }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-300"
                  placeholder="PK00..."
                />
              </label>
            </>
          ) : (
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">{paymentMethodLabels[paymentDetailsForm.method]} number</span>
              <input
                value={paymentDetailsForm.phone_number}
                onChange={e => setPaymentDetailsForm(f => ({ ...f, phone_number: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-300"
                placeholder="03XXXXXXXXX"
              />
            </label>
          )}
          <Button type="submit" variant="student" className="w-full" loading={savingPaymentDetails}>
            <Save size={14} /> Save Payment Details
          </Button>
        </form>
      )}

      {isOwner && project.status === 'completed' && !details && (
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm font-semibold text-amber-700">
          Waiting for the student to add payment details.
        </div>
      )}

      {isOwner && details && (
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            {details.method === 'bank' ? <Landmark size={13} /> : <CreditCard size={13} />}
            Student receiving details
          </div>
          <div className="mt-2 space-y-1 text-sm text-slate-700">
            <p><span className="font-semibold">Method:</span> {paymentMethodLabels[details.method]}</p>
            <p><span className="font-semibold">Title:</span> {details.account_title}</p>
            {details.phone_number && <p><span className="font-semibold">Number:</span> {details.phone_number}</p>}
            {details.bank_name && <p><span className="font-semibold">Bank:</span> {details.bank_name}</p>}
            {details.account_number && <p><span className="font-semibold">Account:</span> {details.account_number}</p>}
            {details.iban && <p><span className="font-semibold">IBAN:</span> {details.iban}</p>}
          </div>
        </div>
      )}

      {canEmployerPay && (
        <form onSubmit={onSubmitPayment} className="space-y-3">
          <input type="hidden" value={details.method} readOnly />
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Amount paid</span>
            <input
              type="number"
              min="1"
              value={paymentForm.amount}
              onChange={e => setPaymentForm(f => ({ ...f, amount: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-300"
              placeholder="PKR amount"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Transaction ID / reference</span>
            <input
              value={paymentForm.transaction_reference}
              onChange={e => setPaymentForm(f => ({ ...f, transaction_reference: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-300"
              placeholder="Receipt or transaction reference"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Receipt screenshot / PDF</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={e => setPaymentReceipt(e.target.files?.[0] || null)}
              className="mt-2 w-full text-sm text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-employer-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-employer-700 hover:file:bg-employer-100"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Note</span>
            <textarea
              value={paymentForm.note}
              onChange={e => setPaymentForm(f => ({ ...f, note: e.target.value }))}
              rows={2}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-300"
              placeholder="Optional"
            />
          </label>
          <Button type="submit" variant="employer" className="w-full" loading={submittingPayment} disabled={!paymentReceipt}>
            <Wallet size={14} /> Pay Student
          </Button>
        </form>
      )}

      {isHiredStudent && payment?.status === 'submitted' && (
        <div className="grid gap-2">
          <Button variant="success" className="w-full" loading={confirmingPayment} onClick={() => onConfirmPayment(payment)}>
            <CheckCircle size={14} /> Confirm Received
          </Button>
          <Button variant="secondary" className="w-full" loading={disputingPayment} onClick={() => onDisputePayment(payment)}>
            <AlertCircle size={14} /> Report Issue
          </Button>
        </div>
      )}
    </div>
  )
}

export default function ProjectDetail() {
  const { id }    = useParams()
  const { user }  = useAuth()

  const [project,  setProject]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [deliveryFile, setDeliveryFile] = useState(null)
  const [uploadingDelivery, setUploadingDelivery] = useState(false)
  const [downloadingDelivery, setDownloadingDelivery] = useState(false)
  const [startingReview, setStartingReview] = useState(false)
  const [decidingDelivery, setDecidingDelivery] = useState(null)
  const [paymentDetailsForm, setPaymentDetailsForm] = useState({
    method: 'easypaisa',
    account_title: '',
    phone_number: '',
    bank_name: '',
    account_number: '',
    iban: '',
  })
  const [savingPaymentDetails, setSavingPaymentDetails] = useState(false)
  const [paymentForm, setPaymentForm] = useState({ amount: '', transaction_reference: '', note: '' })
  const [paymentReceipt, setPaymentReceipt] = useState(null)
  const [submittingPayment, setSubmittingPayment] = useState(false)
  const [downloadingReceipt, setDownloadingReceipt] = useState(false)
  const [confirmingPayment, setConfirmingPayment] = useState(false)
  const [disputingPayment, setDisputingPayment] = useState(false)

  useEffect(() => {
    setLoading(true)
    getProject(id)
      .then(res => {
        const p = res.data.data ?? res.data
        setProject(p)
        syncPaymentDetailsForm(p)
      })
      .catch(err => {
        const msg = err.response?.data?.message || 'Failed to load project.'
        toast.error(msg)
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!user) return
    const timer = setInterval(() => {
      getProject(id)
        .then(res => {
          const p = res.data.data ?? res.data
          setProject(p)
          syncPaymentDetailsForm(p)
        })
        .catch(() => {})
    }, 8000)
    return () => clearInterval(timer)
  }, [id, user])

  function syncPaymentDetailsForm(p) {
    if (!p?.payment_details) return
    setPaymentDetailsForm({
      method: p.payment_details.method || 'easypaisa',
      account_title: p.payment_details.account_title || '',
      phone_number: p.payment_details.phone_number || '',
      bank_name: p.payment_details.bank_name || '',
      account_number: p.payment_details.account_number || '',
      iban: p.payment_details.iban || '',
    })
  }

  async function handleDeliver(e) {
    e.preventDefault()
    if (!deliveryFile) return
    setUploadingDelivery(true)
    try {
      const res = await deliverProject(id, deliveryFile)
      setProject(res.data.data)
      setDeliveryFile(null)
      toast.success(res.data.message || 'Project delivered.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deliver project.')
    } finally {
      setUploadingDelivery(false)
    }
  }

  async function handleDownloadDelivery() {
    setDownloadingDelivery(true)
    try {
      const res = await downloadDelivery(id)
      const blobUrl = URL.createObjectURL(new Blob([res.data], { type: 'application/zip' }))
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = project.delivery_original_name || `${project.title || 'project'}-delivery.zip`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(blobUrl)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to download delivery.')
    } finally {
      setDownloadingDelivery(false)
    }
  }

  async function handleStartReview() {
    setStartingReview(true)
    try {
      const res = await startProjectReview(id)
      setProject(res.data.data)
      toast.success(res.data.message || 'Project moved to review.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start review.')
    } finally {
      setStartingReview(false)
    }
  }

  async function handleDeliveryDecision(decision) {
    const note = decision === 'rejected'
      ? window.prompt('Optional note for the student about what needs to change:', '') || ''
      : ''
    setDecidingDelivery(decision)
    try {
      const res = await decideProjectDelivery(id, decision, note)
      setProject(res.data.data)
      toast.success(res.data.message || 'Delivery updated.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update delivery.')
    } finally {
      setDecidingDelivery(null)
    }
  }

  async function refreshProject() {
    const res = await getProject(id)
    const updated = res.data.data ?? res.data
    setProject(updated)
    syncPaymentDetailsForm(updated)
    return updated
  }

  async function handleSavePaymentDetails(e) {
    e.preventDefault()
    const ok = window.confirm(
      'Please confirm these payment details are correct. You will not be able to change them later for this project.'
    )
    if (!ok) return

    setSavingPaymentDetails(true)
    try {
      await savePaymentDetails(id, paymentDetailsForm)
      await refreshProject()
      toast.success('Payment details saved.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save payment details.')
    } finally {
      setSavingPaymentDetails(false)
    }
  }

  async function handleSubmitPayment(e) {
    e.preventDefault()
    if (!project.payment_details) {
      toast.error('Student payment details are not available yet.')
      return
    }
    if (!paymentReceipt) {
      toast.error('Attach the payment receipt.')
      return
    }

    setSubmittingPayment(true)
    try {
      await submitProjectPayment(id, {
        ...paymentForm,
        method: project.payment_details.method,
        receipt_file: paymentReceipt,
      })
      setPaymentForm({ amount: '', transaction_reference: '', note: '' })
      setPaymentReceipt(null)
      await refreshProject()
      toast.success('Payment submitted to student.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit payment.')
    } finally {
      setSubmittingPayment(false)
    }
  }

  async function handleDownloadPaymentReceipt(payment) {
    setDownloadingReceipt(true)
    try {
      const res = await downloadPaymentReceipt(id, payment.id)
      const blobUrl = URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = payment.receipt_original_name || `${project.title || 'project'}-payment-receipt`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(blobUrl)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to download payment receipt.')
    } finally {
      setDownloadingReceipt(false)
    }
  }

  async function handleConfirmPayment(payment) {
    setConfirmingPayment(true)
    try {
      await confirmProjectPayment(id, payment.id)
      await refreshProject()
      toast.success('Payment confirmed.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm payment.')
    } finally {
      setConfirmingPayment(false)
    }
  }

  async function handleDisputePayment(payment) {
    const note = window.prompt('What issue did you face with this payment?', '') || ''
    setDisputingPayment(true)
    try {
      await disputeProjectPayment(id, payment.id, note)
      await refreshProject()
      toast.success('Payment issue reported.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to report payment issue.')
    } finally {
      setDisputingPayment(false)
    }
  }

  if (loading) return <SkeletonDetail />

  if (!project) {
    return (
      <div className="empty-state">
        <div className="text-5xl mb-4">🔍</div>
        <p className="empty-state-title">Project not found</p>
        <Link to="/projects" className="mt-4 inline-block">
          <Button variant="secondary" size="sm"><ArrowLeft size={14} /> Back to Projects</Button>
        </Link>
      </div>
    )
  }

  const skills = Array.isArray(project.skills_required)
    ? project.skills_required
    : typeof project.skills_required === 'string'
      ? project.skills_required.split(',').map(s => s.trim()).filter(Boolean)
      : []

  const isOwner      = user?.role === 'employer' && String(project.employer_id) === String(user?.id)
  const isStudent    = user?.role === 'student'
  const isHiredStudent = isStudent && String(project.hired_student_id || '') === String(user?.id || '')
  const isClosed     = project.status === 'closed'

  const budgetStr = formatBudgetRange(project.budget_min, project.budget_max)
  const urgency = deadlineUrgency(project.deadline)
  const typeInfo = typeLabels[project.type]
  const durationStr = durationLabels[project.duration]

  const deadlineStr = project.deadline
    ? new Date(project.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '—'

  return (
    <div className="animate-fade-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link to="/projects" className="hover:text-brand-600 transition-colors flex items-center gap-1">
          <ArrowLeft size={14} /> Projects
        </Link>
        <span>/</span>
        <span className="text-slate-600 font-medium truncate">{project.title}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left — main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title + meta */}
          <div>
            <div className="flex items-start gap-3 flex-wrap mb-3">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 leading-tight flex-1">
                {project.title}
              </h1>
              <StatusBadge status={project.status} />
            </div>

            {/* Meta pills */}
            <div className="flex flex-wrap items-center gap-2">
              {project.employer_name && (
                <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-[9px] font-bold">
                    {getInitials(project.employer_name)}
                  </div>
                  {project.employer_id ? (
                    <Link to={`/profile/${project.employer_id}`} className="font-medium text-slate-700 hover:text-brand-600 transition-colors">
                      {project.employer_name}
                    </Link>
                  ) : (
                    <span className="font-medium text-slate-700">{project.employer_name}</span>
                  )}
                </span>
              )}
              {typeInfo && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  {typeInfo.icon} {typeInfo.label}
                </span>
              )}
              {durationStr && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  <Clock size={11} /> {durationStr}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="section-label">Project Description</h2>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="section-label">Skills Required</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((s, i) => (
                  <span key={s} className={chipColorClass(i)}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Apply form (student) */}
          {isStudent && !isClosed && showForm && (!project.already_applied || project.my_application_status === 'withdrawn') && (
            <div className="bg-white rounded-2xl border border-student-200 shadow-sm p-6 ring-1 ring-student-100">
              <h2 className="font-display font-bold text-slate-900 mb-1">Apply for this Project</h2>
              <p className="text-xs text-slate-400 mb-2">Write a compelling cover letter to stand out</p>
              <ApplyForm
                projectId={id}
                onSuccess={() => { setProject(prev => ({ ...prev, already_applied: true, my_application_status: 'pending' })); setShowForm(false) }}
              />
            </div>
          )}

          {/* Employer: Applications */}
          {isOwner && <ApplicationsSection projectId={id} />}
        </div>

        {/* Right — sidebar */}
        <div className="space-y-4">
          <ProjectDeliveryPanel
            project={project}
            isOwner={isOwner}
            isHiredStudent={isHiredStudent}
            deliveryFile={deliveryFile}
            setDeliveryFile={setDeliveryFile}
            uploadingDelivery={uploadingDelivery}
            onDeliver={handleDeliver}
            downloadingDelivery={downloadingDelivery}
            onDownload={handleDownloadDelivery}
            startingReview={startingReview}
            onStartReview={handleStartReview}
            decidingDelivery={decidingDelivery}
            onDecision={handleDeliveryDecision}
          />

          <ProjectPaymentPanel
            project={project}
            isOwner={isOwner}
            isHiredStudent={isHiredStudent}
            paymentDetailsForm={paymentDetailsForm}
            setPaymentDetailsForm={setPaymentDetailsForm}
            savingPaymentDetails={savingPaymentDetails}
            onSavePaymentDetails={handleSavePaymentDetails}
            paymentForm={paymentForm}
            setPaymentForm={setPaymentForm}
            paymentReceipt={paymentReceipt}
            setPaymentReceipt={setPaymentReceipt}
            submittingPayment={submittingPayment}
            onSubmitPayment={handleSubmitPayment}
            downloadingReceipt={downloadingReceipt}
            onDownloadReceipt={handleDownloadPaymentReceipt}
            confirmingPayment={confirmingPayment}
            onConfirmPayment={handleConfirmPayment}
            disputingPayment={disputingPayment}
            onDisputePayment={handleDisputePayment}
          />

          {/* Info card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                <CalendarDays size={16} className="text-slate-500" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Deadline</p>
                <p className="text-sm font-semibold text-slate-800">{deadlineStr}</p>
              </div>
              {urgency && (
                <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${urgency.color}`}>
                  {urgency.icon} {urgency.label}
                </span>
              )}
            </div>

            <div className="divider !my-3" />

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Users size={16} className="text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Applications</p>
                <p className="text-sm font-semibold text-slate-800">{project.application_count ?? project.applications_count ?? 0}</p>
              </div>
            </div>

            {/* Budget */}
            {budgetStr && (
              <>
                <div className="divider !my-3" />
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Briefcase size={16} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Budget</p>
                    <p className="text-sm font-bold text-emerald-700">{budgetStr}</p>
                  </div>
                </div>
              </>
            )}

            {/* Views */}
            {project.views != null && (
              <>
                <div className="divider !my-3" />
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Eye size={16} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Views</p>
                    <p className="text-sm font-semibold text-slate-800">{project.views}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 space-y-3">
            {/* Not logged in */}
            {!user && (
              <Link to="/login">
                <Button variant="primary" className="w-full">Login to Apply</Button>
              </Link>
            )}

            {/* Student */}
            {isStudent && (() => {
              const status = project.my_application_status
              // approved/rejected → terminal states (no re-apply)
              // withdrawn → allow re-apply
              const isTerminal = ['approved', 'rejected'].includes(status)
              const isPending  = status === 'pending'

              if (status === 'approved') {
                return (
                  <div className="flex items-center gap-2 justify-center text-emerald-600 font-semibold text-sm py-3
                    bg-emerald-50 rounded-xl border border-emerald-200">
                    <CheckCircle size={16} />
                    🎉 Application Approved!
                  </div>
                )
              }
              if (status === 'rejected') {
                return (
                  <div className="flex items-center gap-2 justify-center text-red-500 font-semibold text-sm py-3
                    bg-red-50 rounded-xl border border-red-200">
                    Application Not Selected
                  </div>
                )
              }
              if (isPending) {
                return (
                  <div className="flex items-center gap-2 justify-center text-amber-600 font-semibold text-sm py-3
                    bg-amber-50 rounded-xl border border-amber-200">
                    <CheckCircle size={16} />
                    Application Submitted — Pending Review
                  </div>
                )
              }

              // withdrawn OR no application yet → show apply button
              if (isClosed) {
                return <Button variant="secondary" disabled className="w-full">Applications Closed</Button>
              }

              return (
                <Button
                  variant="student"
                  className="w-full"
                  onClick={() => setShowForm(v => !v)}
                >
                  {showForm ? 'Cancel' : '✨ Apply for this Project'}
                </Button>
              )
            })()}

            {/* Employer owner */}
            {isOwner && (
              <>
                <Link to={`/projects/${id}/edit`}>
                  <Button variant="secondary" className="w-full">
                    <Edit size={15} /> Edit Project
                  </Button>
                </Link>
                <button
                  onClick={() => document.getElementById('applications-anchor')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full text-sm text-brand-600 hover:text-brand-700 font-medium py-2 transition-colors rounded-xl hover:bg-brand-50"
                >
                  Manage Applications ↓
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
