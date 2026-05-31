import { NavLink as RouterNavLink, Link } from 'react-router-dom'
import { useEffect, useState, useRef, useCallback } from 'react'
import {
  LogOut, LayoutDashboard, Briefcase, ArrowLeftRight,
  FileText, FolderOpen, Bell, BellRing, User, ShieldCheck,
  Menu, X, ChevronRight, MessageSquare, Users, GraduationCap, Building2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getUnreadCount } from '../api/notifications'
import { getUnreadMessageCount } from '../api/messages'
import { getInitials } from '../utils/format'
import Button from './ui/Button'

const POLL_INTERVAL = 8000

// Role-based design tokens
const roleConfig = {
  student: {
    border: 'border-student-500',
    gradientBorder: 'from-student-400 via-student-500 to-student-600',
    logoBg: 'bg-student-600',
    logoHover: 'group-hover:bg-student-700',
    navActive: 'bg-student-50 text-student-700 font-semibold',
    navHover: 'hover:bg-student-50 hover:text-student-600',
    badge: 'bg-gradient-to-r from-student-500 to-student-600 text-white',
    badgeLabel: 'Student',
    bellActive: 'text-student-600',
    drawerActive: 'bg-student-50 text-student-700',
    avatarBg: 'bg-student-500',
    pillBg: 'bg-student-50 text-student-700 border-student-200',
  },
  employer: {
    border: 'border-employer-500',
    gradientBorder: 'from-employer-400 via-employer-500 to-employer-600',
    logoBg: 'bg-employer-600',
    logoHover: 'group-hover:bg-employer-700',
    navActive: 'bg-employer-50 text-employer-700 font-semibold',
    navHover: 'hover:bg-employer-50 hover:text-employer-600',
    badge: 'bg-gradient-to-r from-employer-500 to-employer-600 text-white',
    badgeLabel: 'Employer',
    bellActive: 'text-employer-600',
    drawerActive: 'bg-employer-50 text-employer-700',
    avatarBg: 'bg-employer-500',
    pillBg: 'bg-employer-50 text-employer-700 border-employer-200',
  },
  admin: {
    border: 'border-amber-400',
    gradientBorder: 'from-amber-400 via-amber-500 to-amber-600',
    logoBg: 'bg-amber-500',
    logoHover: 'group-hover:bg-amber-600',
    navActive: 'bg-amber-50 text-amber-700 font-semibold',
    navHover: 'hover:bg-amber-50 hover:text-amber-600',
    badge: 'bg-gradient-to-r from-amber-400 to-amber-600 text-white',
    badgeLabel: 'Admin',
    bellActive: 'text-amber-600',
    drawerActive: 'bg-amber-50 text-amber-700',
    avatarBg: 'bg-amber-500',
    pillBg: 'bg-amber-50 text-amber-700 border-amber-200',
  },
}

const defaultRole = {
  border: 'border-slate-200',
  gradientBorder: 'from-brand-400 via-brand-500 to-brand-600',
  logoBg: 'bg-brand-600',
  logoHover: 'group-hover:bg-brand-700',
  navActive: 'bg-brand-50 text-brand-700 font-semibold',
  navHover: 'hover:bg-brand-50 hover:text-brand-600',
  badge: 'bg-slate-100 text-slate-600',
  badgeLabel: 'Guest',
  bellActive: 'text-brand-600',
  drawerActive: 'bg-brand-50 text-brand-700',
  avatarBg: 'bg-brand-500',
  pillBg: 'bg-slate-100 text-slate-600 border-slate-200',
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [unreadMsgCount, setUnreadMsgCount] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pollRef = useRef(null)

  const rc = user ? (roleConfig[user.role] || defaultRole) : defaultRole

  const fetchUnread = useCallback(() => {
    if (!user) return
    getUnreadCount()
      .then(r => setUnreadCount(r.data?.data?.unread_count || 0))
      .catch(() => {})
    getUnreadMessageCount()
      .then(r => setUnreadMsgCount(r.data?.data?.unread_count || 0))
      .catch(() => {})
  }, [user])

  useEffect(() => {
    fetchUnread()
    if (user) {
      pollRef.current = setInterval(fetchUnread, POLL_INTERVAL)
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [user, fetchUnread])

  useEffect(() => {
    const handler = (e) => {
      if (typeof e.detail?.count === 'number') setUnreadCount(e.detail.count)
    }
    window.addEventListener('navbar:unread', handler)
    return () => window.removeEventListener('navbar:unread', handler)
  }, [])

  // Refetch when user returns to this browser tab
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchUnread()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [fetchUnread])

  const sharedNavItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={15} />, label: 'Dashboard', show: true },
    { to: '/projects',  icon: <Briefcase size={15} />,       label: 'Projects',  show: !!user },
    { to: '/skill-swap',icon: <ArrowLeftRight size={15} />,  label: 'Skill Swap',show: !!user },
  ]
  const publicNavItems = [
    { to: '/', icon: <LayoutDashboard size={15} />, label: 'Home' },
    { to: '/about', icon: <Users size={15} />, label: 'About' },
    { to: '/project-workflow', icon: <Briefcase size={15} />, label: 'Projects' },
    { to: '/skill-swap-info', icon: <ArrowLeftRight size={15} />, label: 'Skill Swap' },
    { to: '/for-students', icon: <GraduationCap size={15} />, label: 'Students' },
    { to: '/for-employers', icon: <Building2 size={15} />, label: 'Employers' },
  ]
  const studentOnlyItems = [
    { to: '/my-applications', icon: <FileText size={15} />, label: 'My Applications', show: user?.role === 'student' },
  ]
  const employerOnlyItems = [
    { to: '/my-projects', icon: <FolderOpen size={15} />, label: 'My Projects', show: user?.role === 'employer' },
  ]
  const adminOnlyItems = [
    { to: '/admin', icon: <ShieldCheck size={15} />, label: 'Admin Panel', show: user?.role === 'admin' },
  ]

  const allNavItems = user ? [
    ...sharedNavItems,
    ...studentOnlyItems,
    ...employerOnlyItems,
    ...adminOnlyItems,
  ].filter(i => i.show) : publicNavItems

  const roleSpecificItems = [...studentOnlyItems, ...employerOnlyItems, ...adminOnlyItems].filter(i => i.show)

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/70 transition-all shadow-sm shadow-slate-200/40">
        {/* Role gradient strip */}
        {user && <div className={`h-[3px] bg-gradient-to-r ${rc.gradientBorder}`} />}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Logo + Role Pill */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
              <div className={`w-10 h-10 ${rc.logoBg} ${rc.logoHover} rounded-2xl flex items-center justify-center shadow-card transition-colors ring-1 ring-white/80`}>
                <span className="text-white font-display text-base font-bold leading-none">S</span>
              </div>
              <span className="font-display font-bold text-slate-950 text-lg tracking-tight hidden sm:block">
                SkillMarket
              </span>
            </Link>
            {user && (
              <span className={`hidden lg:inline-flex items-center text-[11px] font-semibold px-3 py-1.5 rounded-full border ${rc.pillBg}`}>
                {rc.badgeLabel}
              </span>
            )}
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center rounded-2xl bg-slate-100/70 p-1 ring-1 ring-white/80">
            {user ? (
              <>
                {/* Shared items */}
                <div className="flex items-center gap-0.5">
                  {sharedNavItems.filter(i => i.show).map(item => (
                    <NavItem key={item.to} to={item.to} icon={item.icon} rc={rc}>{item.label}</NavItem>
                  ))}
                </div>

                {/* Role-specific items with divider */}
                {roleSpecificItems.length > 0 && (
                  <>
                    <div className="w-px h-5 bg-slate-200 mx-2" />
                    <div className="flex items-center gap-0.5">
                      {roleSpecificItems.map(item => (
                        <NavItem key={item.to} to={item.to} icon={item.icon} rc={rc} roleSpecific>{item.label}</NavItem>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center gap-0.5">
                {publicNavItems.map(item => (
                  <NavItem key={item.to} to={item.to} icon={item.icon} rc={rc}>{item.label}</NavItem>
                ))}
              </div>
            )}
          </nav>

          {/* Right area */}
          <div className="flex items-center gap-1.5">
            {user ? (
              <>
                {/* Messages */}
                <Link
                  to="/messages"
                  className="relative p-2.5 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors hidden sm:flex"
                  title="Messages"
                >
                  <MessageSquare size={17} />
                  {unreadMsgCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-blue-500 text-white text-[9px] font-bold px-1 leading-none shadow-sm animate-scale-in">
                      {unreadMsgCount > 99 ? '99+' : unreadMsgCount}
                    </span>
                  )}
                </Link>

                {/* Notifications */}
                <Link
                  to="/notifications"
                  className="relative p-2.5 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Notifications"
                >
                  {unreadCount > 0
                    ? <BellRing size={17} className={rc.bellActive} />
                    : <Bell size={17} />
                  }
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-1 leading-none shadow-sm">
                      {unreadCount > 99 ? '99+' : unreadCount}
                      <span className="absolute inset-0 rounded-full bg-red-500 animate-dot-pulse opacity-40" />
                    </span>
                  )}
                </Link>

                {/* User avatar + name */}
                <Link
                  to="/profile"
                  className="hidden sm:flex items-center gap-2 px-2 py-1.5 rounded-2xl hover:bg-slate-100/80 transition-colors"
                  title="My Profile"
                >
                  <div className={`w-8 h-8 rounded-2xl ${rc.avatarBg} flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 shadow-sm`}>
                    {getInitials(user.name)}
                  </div>
                  <span className="text-sm font-medium text-slate-700 hidden lg:block max-w-[100px] truncate">{user.name}</span>
                </Link>

                {/* Logout */}
                <button
                  onClick={logout}
                  className="p-2.5 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors hidden sm:flex"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>

                {/* Mobile hamburger */}
                <button
                  onClick={() => setMobileOpen(v => !v)}
                  className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                  aria-label="Toggle menu"
                >
                  {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Sign up free</Button>
                </Link>
                <button
                  onClick={() => setMobileOpen(v => !v)}
                  className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col animate-slide-left">

            {/* Drawer header with role banner */}
            {user ? (
              <div className={`px-4 pt-5 pb-4 ${user.role === 'student' ? 'bg-gradient-to-br from-student-500 to-student-700' : user.role === 'employer' ? 'bg-gradient-to-br from-employer-500 to-employer-700' : 'bg-gradient-to-br from-amber-400 to-amber-600'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">{rc.badgeLabel}</span>
                  <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10">
                    <X size={17} />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{user.name}</p>
                    <p className="text-white/70 text-xs">{user.email}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between px-4 h-14 border-b border-slate-100">
                <span className="font-display font-bold text-slate-900 text-base">SkillMarket</span>
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100">
                  <X size={18} />
                </button>
              </div>
            )}

            <nav className="flex-1 overflow-y-auto py-3 px-2">
              {allNavItems.map(item => (
                <RouterNavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all mb-0.5 ${
                      isActive ? rc.drawerActive : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  {item.icon}
                  {item.label}
                  <ChevronRight size={14} className="ml-auto opacity-30" />
                </RouterNavLink>
              ))}

              {user && (
                <>
                  <div className="my-2 h-px bg-slate-100 mx-2" />
                  <RouterNavLink
                    to="/messages"
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all mb-0.5 ${
                        isActive ? rc.drawerActive : 'text-slate-600 hover:bg-slate-50'
                      }`
                    }
                  >
                    <MessageSquare size={15} /> Messages
                    {unreadMsgCount > 0 && (
                      <span className="ml-auto min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-blue-500 text-white text-[10px] font-bold">
                        {unreadMsgCount}
                      </span>
                    )}
                    {!unreadMsgCount && <ChevronRight size={14} className="ml-auto opacity-30" />}
                  </RouterNavLink>
                  <RouterNavLink
                    to="/notifications"
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all mb-0.5 ${
                        isActive ? rc.drawerActive : 'text-slate-600 hover:bg-slate-50'
                      }`
                    }
                  >
                    <Bell size={15} /> Notifications
                    {unreadCount > 0 && (
                      <span className="ml-auto min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                        {unreadCount}
                      </span>
                    )}
                    {!unreadCount && <ChevronRight size={14} className="ml-auto opacity-30" />}
                  </RouterNavLink>
                  <RouterNavLink
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all mb-0.5 ${
                        isActive ? rc.drawerActive : 'text-slate-600 hover:bg-slate-50'
                      }`
                    }
                  >
                    <User size={15} /> My Profile
                    <ChevronRight size={14} className="ml-auto opacity-30" />
                  </RouterNavLink>
                </>
              )}
            </nav>

            {user && (
              <div className="px-3 py-4 border-t border-slate-100">
                <button
                  onClick={() => { setMobileOpen(false); logout() }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <LogOut size={15} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function NavItem({ to, icon, children, rc, roleSpecific = false }) {
  return (
    <RouterNavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
          isActive
            ? `${rc.navActive} bg-white shadow-sm`
            : `text-slate-500 ${rc.navHover} ${roleSpecific ? 'font-medium' : ''}`
        }`
      }
    >
      {icon}
      {children}
    </RouterNavLink>
  )
}
