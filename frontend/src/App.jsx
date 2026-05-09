import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Spinner from './components/ui/Spinner'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/dashboard/Dashboard'
import ProjectList from './pages/projects/ProjectList'
import ProjectDetail from './pages/projects/ProjectDetail'
import CreateProject from './pages/projects/CreateProject'
import EditProject from './pages/projects/EditProject'
import MyProjects from './pages/projects/MyProjects'
import SkillSwap from './pages/skillswap/SkillSwap'
import MyApplications from './pages/applications/MyApplications'

import Messages from './pages/messages/Messages'
import Conversation from './pages/messages/Conversation'
import Notifications from './pages/notifications/Notifications'
import Profile from './pages/profile/Profile'
import PublicProfile from './pages/profile/PublicProfile'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminProjects from './pages/admin/AdminProjects'
import AdminReports from './pages/admin/AdminReports'
import NotFound from './pages/NotFound'
import toast, { Toaster, ToastBar } from 'react-hot-toast'
import { X } from 'lucide-react'

function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" className="text-brand-600" />
          <p className="text-sm text-slate-400 font-medium">Loading your workspace…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          {/* Root */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Public */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />

          {/* Guest-only */}
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

          {/* Any logged-in user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/skill-swap" element={<SkillSwap />} />
            {/* Nested messages routing — Conversation renders inside Messages via <Outlet> */}
            <Route path="/messages" element={<Messages />}>
              <Route path=":id" element={<Conversation />} />
            </Route>
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<PublicProfile />} />
          </Route>

          {/* Student only */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/my-applications" element={<MyApplications />} />
          </Route>

          {/* Employer only */}
          <Route element={<ProtectedRoute allowedRoles={['employer']} />}>
            <Route path="/projects/create" element={<CreateProject />} />
            <Route path="/projects/:id/edit" element={<EditProject />} />
            <Route path="/my-projects" element={<MyProjects />} />
          </Route>

          {/* Admin only */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/projects" element={<AdminProjects />} />
            <Route path="/admin/reports" element={<AdminReports />} />
          </Route>

          {/* Catch-all — 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
              paddingRight: '8px',
            },
            success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        >
          {(t) => (
            <ToastBar toast={t}>
              {({ icon, message }) => (
                <>
                  {icon}
                  {message}
                  {t.type !== 'loading' && (
                    <button
                      onClick={() => toast.dismiss(t.id)}
                      className="ml-2 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
                    >
                      <X size={14} />
                    </button>
                  )}
                </>
              )}
            </ToastBar>
          )}
        </Toaster>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
