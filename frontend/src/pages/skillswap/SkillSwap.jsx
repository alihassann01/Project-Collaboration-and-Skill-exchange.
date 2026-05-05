import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Plus, X, Search } from 'lucide-react'
import {
  getListings, createListing, sendRequest,
  respondRequest, toggleListing, deleteListing,
} from '../../api/skillswap'
import { startConversation } from '../../api/messages'
import SkillSwapCard from '../../components/SkillSwapCard'
import StatusBadge from '../../components/ui/StatusBadge'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'



function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-200" />
        <div className="h-4 bg-slate-200 rounded w-32" />
      </div>
      <div className="h-3 bg-slate-200 rounded w-3/4" />
      <div className="h-3 bg-slate-200 rounded w-1/2" />
      <div className="h-8 bg-slate-200 rounded-xl w-28 mt-1" />
    </div>
  )
}

const TABS = ['Browse', 'My Listings', 'Requests']

export default function SkillSwap() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Browse')
  const [loading, setLoading]     = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const [otherListings,    setOtherListings]    = useState([])
  const [myListings,       setMyListings]       = useState([])
  const [incomingRequests, setIncomingRequests] = useState([])
  const [outgoingRequests, setOutgoingRequests] = useState([])

  const [sentSet, setSentSet] = useState(new Set())

  // Add listing form
  const [showForm,   setShowForm]   = useState(false)
  const [formData,   setFormData]   = useState({ teach_skill: '', learn_skill: '' })
  const [formErrors, setFormErrors] = useState({})
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    getListings()
      .then(res => {
        const d = res.data?.data ?? res.data
        setOtherListings(d.other_listings   ?? [])
        setMyListings(d.my_listings         ?? [])
        setIncomingRequests(d.incoming_requests ?? [])
        setOutgoingRequests(d.outgoing_requests ?? [])
      })
      .catch(err => toast.error(err.response?.data?.message || 'Failed to load listings.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSendRequest(listingId) {
    try {
      await sendRequest(listingId)
      setSentSet(prev => new Set([...prev, listingId]))
      toast.success('Request sent!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request.')
    }
  }

  function validateForm() {
    const errs = {}
    if (!formData.teach_skill.trim()) errs.teach_skill = 'Required.'
    if (!formData.learn_skill.trim()) errs.learn_skill = 'Required.'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleCreateListing(e) {
    e.preventDefault()
    if (!validateForm()) return
    setFormLoading(true)
    try {
      const res = await createListing(formData)
      const newListing = res.data.data
      setMyListings(prev => [newListing, ...prev])
      setFormData({ teach_skill: '', learn_skill: '' })
      setShowForm(false)
      toast.success('Listing added!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing.')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleToggle(id) {
    try {
      await toggleListing(id)
      setMyListings(prev => prev.map(l => l.id === id ? { ...l, is_active: !l.is_active } : l))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle listing.')
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this listing?')) return
    try {
      await deleteListing(id)
      setMyListings(prev => prev.filter(l => l.id !== id))
      toast.success('Listing deleted.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete listing.')
    }
  }

  async function handleRespond(requestId, status) {
    try {
      await respondRequest(requestId, status)
      setIncomingRequests(prev =>
        prev.map(r => r.id === requestId ? { ...r, status } : r)
      )
      toast.success(status === 'accepted' ? 'Request accepted!' : 'Request declined.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to respond.')
    }
  }

  const pendingIncoming = incomingRequests.filter(r => r.status === 'pending').length

  return (
    <div className="animate-fade-up space-y-6">
      {/* Heading */}
      <div>
        <h1 className="font-display text-2xl font-700 text-slate-900">Skill Swap</h1>
        <p className="text-slate-500 text-sm mt-1">Teach what you know. Learn what you don't.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
            {tab === 'Requests' && pendingIncoming > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {pendingIncoming}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Browse ── */}
      {activeTab === 'Browse' && (
        loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : otherListings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 py-20 text-center">
            <p className="text-slate-400 font-medium">No listings from other users yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search/Filter input */}
            <div className="relative max-w-sm">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by skill or name…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition-all placeholder:text-slate-400"
              />
            </div>
            {(() => {
              const q = searchQuery.toLowerCase().trim()
              const filtered = q
                ? otherListings.filter(l =>
                    l.teach_skill?.toLowerCase().includes(q) ||
                    l.learn_skill?.toLowerCase().includes(q) ||
                    l.user_name?.toLowerCase().includes(q)
                  )
                : otherListings
              return filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 py-12 text-center">
                  <p className="text-slate-400">No listings match "{searchQuery}".</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filtered.map(l => (
                    <SkillSwapCard
                      key={l.id}
                      listing={l}
                      onRequest={handleSendRequest}
                      requestSent={sentSet.has(l.id)}
                    />
                  ))}
                </div>
              )
            })()}
          </div>
        )
      )}

      {/* ── Tab: My Listings ── */}
      {activeTab === 'My Listings' && (
        <div className="space-y-5">
          {/* Add button */}
          <div className="flex justify-end">
            <Button
              variant={showForm ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => setShowForm(v => !v)}
            >
              {showForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Add New Listing</>}
            </Button>
          </div>

          {/* Inline form */}
          {showForm && (
            <form onSubmit={handleCreateListing}
              className="bg-white rounded-2xl border border-brand-200 shadow-sm p-5 flex flex-col gap-4">
              <h3 className="font-semibold text-slate-800 text-sm">New Listing</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-600">I can teach:</label>
                  <input
                    type="text"
                    value={formData.teach_skill}
                    onChange={e => setFormData(f => ({ ...f, teach_skill: e.target.value }))}
                    placeholder="e.g. React.js"
                    className={`px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border transition-all
                      focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white
                      ${formErrors.teach_skill ? 'border-red-400' : 'border-slate-200'}`}
                  />
                  {formErrors.teach_skill && <p className="text-xs text-red-500">{formErrors.teach_skill}</p>}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-600">I want to learn:</label>
                  <input
                    type="text"
                    value={formData.learn_skill}
                    onChange={e => setFormData(f => ({ ...f, learn_skill: e.target.value }))}
                    placeholder="e.g. Laravel"
                    className={`px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border transition-all
                      focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white
                      ${formErrors.learn_skill ? 'border-red-400' : 'border-slate-200'}`}
                  />
                  {formErrors.learn_skill && <p className="text-xs text-red-500">{formErrors.learn_skill}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="primary" size="sm" loading={formLoading}>
                  Add Listing
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* My listings grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : myListings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 py-20 text-center">
              <p className="text-slate-400 font-medium">You haven't created any listings yet. Add one above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {myListings.map(l => (
                <div key={l.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-400 w-20 shrink-0">Can teach:</span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                        {l.teach_skill}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-400 w-20 shrink-0">Wants to learn:</span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                        {l.learn_skill}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2 flex-wrap">
                    {/* Toggle */}
                    <button
                      onClick={() => handleToggle(l.id)}
                      className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                        l.is_active
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${l.is_active ? 'bg-green-500' : 'bg-slate-400'}`} />
                      {l.is_active ? 'Active' : 'Inactive'}
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(l.id)}
                      className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Requests ── */}
      {activeTab === 'Requests' && (
        <div className="space-y-8">
          {/* Incoming */}
          <div>
            <h2 className="font-semibold text-slate-800 mb-4">
              Incoming Requests
              <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                {incomingRequests.length}
              </span>
            </h2>
            {incomingRequests.length === 0 ? (
              <p className="text-sm text-slate-400">No incoming requests yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {incomingRequests.map(r => (
                  <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-semibold text-sm">
                        <Link to={`/profile/${r.requester_id || r.from_user_id}`} className="text-slate-800 hover:text-brand-600 transition-colors">
                          {r.requester_name}
                        </Link>
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Teach: <span className="text-green-600 font-medium">{r.teach_skill}</span>
                        {' · '}Learn: <span className="text-blue-600 font-medium">{r.learn_skill}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={r.status} />
                      {r.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleRespond(r.id, 'accepted')}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRespond(r.id, 'rejected')}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {r.status === 'accepted' && (
                        <button
                          onClick={async () => {
                            try {
                              const res = await startConversation(r.requester_id || r.from_user_id)
                              navigate(`/messages/${res.data.data.conversation_id}`)
                            } catch (err) {
                              toast.error(err.response?.data?.message || 'Failed to start conversation.')
                            }
                          }}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors border border-brand-200"
                        >
                          💬 Connect on Messages
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing */}
          <div>
            <h2 className="font-semibold text-slate-800 mb-4">
              Sent Requests
              <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                {outgoingRequests.length}
              </span>
            </h2>
            {outgoingRequests.length === 0 ? (
              <p className="text-sm text-slate-400">You haven't sent any requests yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {outgoingRequests.map(r => (
                  <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{r.owner_name ?? 'User'}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Teach: <span className="text-green-600 font-medium">{r.teach_skill}</span>
                        {' · '}Learn: <span className="text-blue-600 font-medium">{r.learn_skill}</span>
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
