SKILLMARKET PRO — UI ELEGANCE & ROLE DIFFERENTIATION UPGRADE
==============================================================
You are working on a React + Vite + TailwindCSS + PHP backend project called SkillMarket Pro.
The codebase is already functional. Your job is purely UI/UX — make it look like a premium,
professional SaaS platform and make student vs employer feel completely distinct.

DO NOT break any existing logic, API calls, routing, or data flow.
Only change visual presentation: JSX markup, Tailwind classes, CSS, and structural layout.

=== ADMIN CREDENTIALS (for testing) ===
Email: admin@skillmarket.com
Password: password

Other test accounts (all password: password):
- Student:  ali@student.com
- Student:  sara@student.com
- Employer: employer@techcorp.com

==============================================================
PART 1 — GLOBAL DESIGN SYSTEM UPGRADE
==============================================================

--- FILE: frontend/tailwind.config.js ---
Replace the entire file with this:

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef6ff', 100: '#d9eaff', 200: '#bcd8ff',
          300: '#8ec0ff', 400: '#599eff', 500: '#3179ff',
          600: '#1a57f5', 700: '#1342e1', 800: '#1637b6',
          900: '#18338f', 950: '#142057',
        },
        student: {
          50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd',
          300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9',
          600: '#0284c7', 700: '#0369a1',
        },
        employer: {
          50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe',
          300: '#c4b5fd', 400: '#a78bfa', 500: '#8b5cf6',
          600: '#7c3aed', 700: '#6d28d9',
        },
      },
      boxShadow: {
        'card': '0 0 0 1px rgba(0,0,0,0.05), 0 4px 24px rgba(0,0,0,0.07)',
        'card-hover': '0 0 0 1px rgba(49,121,255,0.18), 0 12px 40px rgba(49,121,255,0.14)',
        'glow': '0 0 0 3px rgba(49,121,255,0.25)',
        'glow-student': '0 0 0 3px rgba(14,165,233,0.25)',
        'glow-employer': '0 0 0 3px rgba(139,92,246,0.25)',
        'inner-sm': 'inset 0 1px 3px rgba(0,0,0,0.06)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-student': 'linear-gradient(135deg, #0ea5e9 0%, #3179ff 100%)',
        'hero-employer': 'linear-gradient(135deg, #8b5cf6 0%, #1a57f5 100%)',
        'hero-admin': 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
        'mesh': 'radial-gradient(at 20% 20%, rgba(49,121,255,0.12) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(99,102,241,0.10) 0px, transparent 50%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fadeIn 0.3s ease both',
        'slide-left': 'slideLeft 0.25s ease-out',
        'scale-in': 'scaleIn 0.2s ease both',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideLeft: {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}


--- FILE: frontend/src/index.css ---
Replace the entire file with this:

@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    @apply bg-slate-50 text-slate-800 font-sans antialiased;
    min-height: 100vh;
    font-feature-settings: 'cv11', 'ss01';
  }
  ::selection { @apply bg-brand-100 text-brand-900; }
}

@layer components {
  .auth-card {
    @apply bg-white/90 backdrop-blur-sm rounded-3xl shadow-card p-8 w-full max-w-md mx-auto border border-white;
  }
  .field-error {
    @apply text-red-500 text-xs mt-1 font-medium;
  }
  /* Glass card effect */
  .glass {
    @apply bg-white/70 backdrop-blur-md border border-white/80;
  }
  /* Premium card */
  .card {
    @apply bg-white rounded-2xl shadow-card border border-slate-100/80;
  }
  /* Role-specific navbar underline strip */
  .role-strip-student  { @apply border-b-2 border-student-500; }
  .role-strip-employer { @apply border-b-2 border-employer-500; }
  .role-strip-admin    { @apply border-b-2 border-amber-500; }
}

/* Auth page mesh gradient */
.auth-bg {
  background-color: #f0f5ff;
  background-image:
    radial-gradient(at 20% 20%, rgba(49,121,255,0.15) 0px, transparent 50%),
    radial-gradient(at 80% 80%, rgba(139,92,246,0.12) 0px, transparent 50%),
    radial-gradient(at 60% 10%, rgba(14,165,233,0.10) 0px, transparent 40%);
  min-height: 100vh;
}

/* Subtle grid pattern for hero sections */
.grid-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

/* Scrollbar styling */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { @apply bg-transparent; }
::-webkit-scrollbar-thumb { @apply bg-slate-200 rounded-full; }
::-webkit-scrollbar-thumb:hover { @apply bg-slate-300; }

/* Mobile drawer */
@keyframes slide-left {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}
.animate-slide-left { animation: slide-left 0.25s ease-out; }


==============================================================
PART 2 — NAVBAR (role-differentiated, premium design)
==============================================================

--- FILE: frontend/src/components/Navbar.jsx ---
Rebuild the entire Navbar with these design rules:
1. The navbar bar itself stays white/frosted glass BUT add a 3px colored bottom border based on role:
   - student → border-b-2 border-student-500 (sky blue)
   - employer → border-b-2 border-employer-500 (violet)
   - admin → border-b-2 border-amber-500 (amber)
   - no user → border-b border-slate-100 (neutral)
2. The logo should be role-colored: student=sky, employer=violet, admin=amber, default=brand-600
3. Student nav items use sky-blue hover/active states (bg-student-50 text-student-700)
4. Employer nav items use violet hover/active states (bg-employer-50 text-employer-700)
5. Admin nav items use amber hover/active states (bg-amber-50 text-amber-700)
6. Role badge in the top right must be prominent and colored:
   - Student: gradient bg from student-500 to student-600, white text, "🎓 Student"
   - Employer: gradient bg from employer-500 to employer-600, white text, "🏢 Employer"
   - Admin: gradient bg from amber-400 to amber-600, white text, "⚡ Admin"
7. User name shown next to role badge on lg screens
8. The notification bell: show filled BellRing icon when there are unreads, use role color for the dot
9. On desktop nav, separate student-only and employer-only items visually with a faint divider
10. Keep all existing logic (polling, mobile drawer, etc.) — only change visual classes

Here is the full replacement JSX:

import { NavLink as RouterNavLink, Link } from 'react-router-dom'
import { useEffect, useState, useRef, useCallback } from 'react'
import {
  LogOut, LayoutDashboard, Briefcase, ArrowLeftRight,
  FileText, FolderOpen, Bell, BellRing, User, ShieldCheck,
  Menu, X, ChevronRight, MessageSquare,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getNotifications } from '../api/notifications'
import Button from './ui/Button'

const POLL_INTERVAL = 30000

// Role-based design tokens
const roleConfig = {
  student: {
    border: 'border-b-2 border-student-500',
    logoBg: 'bg-student-600',
    logoHover: 'group-hover:bg-student-700',
    navActive: 'bg-student-50 text-student-700 font-semibold',
    navHover: 'hover:bg-student-50 hover:text-student-600',
    badge: 'bg-gradient-to-r from-student-500 to-student-600 text-white',
    badgeLabel: '🎓 Student',
    bellActive: 'text-student-600',
    drawerActive: 'bg-student-50 text-student-700',
  },
  employer: {
    border: 'border-b-2 border-employer-500',
    logoBg: 'bg-employer-600',
    logoHover: 'group-hover:bg-employer-700',
    navActive: 'bg-employer-50 text-employer-700 font-semibold',
    navHover: 'hover:bg-employer-50 hover:text-employer-600',
    badge: 'bg-gradient-to-r from-employer-500 to-employer-600 text-white',
    badgeLabel: '🏢 Employer',
    bellActive: 'text-employer-600',
    drawerActive: 'bg-employer-50 text-employer-700',
  },
  admin: {
    border: 'border-b-2 border-amber-400',
    logoBg: 'bg-amber-500',
    logoHover: 'group-hover:bg-amber-600',
    navActive: 'bg-amber-50 text-amber-700 font-semibold',
    navHover: 'hover:bg-amber-50 hover:text-amber-600',
    badge: 'bg-gradient-to-r from-amber-400 to-amber-600 text-white',
    badgeLabel: '⚡ Admin',
    bellActive: 'text-amber-600',
    drawerActive: 'bg-amber-50 text-amber-700',
  },
}

const defaultRole = {
  border: 'border-b border-slate-100',
  logoBg: 'bg-brand-600',
  logoHover: 'group-hover:bg-brand-700',
  navActive: 'bg-brand-50 text-brand-700 font-semibold',
  navHover: 'hover:bg-brand-50 hover:text-brand-600',
  badge: 'bg-slate-100 text-slate-600',
  badgeLabel: 'Guest',
  bellActive: 'text-brand-600',
  drawerActive: 'bg-brand-50 text-brand-700',
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pollRef = useRef(null)

  const rc = user ? (roleConfig[user.role] || defaultRole) : defaultRole

  const fetchUnread = useCallback(() => {
    if (!user) return
    getNotifications()
      .then(r => setUnreadCount(r.data.data.unread_count || 0))
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

  const sharedNavItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={15} />, label: 'Dashboard', show: true },
    { to: '/projects',  icon: <Briefcase size={15} />,       label: 'Projects',  show: true },
    { to: '/skill-swap',icon: <ArrowLeftRight size={15} />,  label: 'Skill Swap',show: !!user },
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

  const allNavItems = [
    ...sharedNavItems,
    ...studentOnlyItems,
    ...employerOnlyItems,
    ...adminOnlyItems,
  ].filter(i => i.show)

  const roleSpecificItems = [...studentOnlyItems, ...employerOnlyItems, ...adminOnlyItems].filter(i => i.show)

  return (
    <>
      <header className={`sticky top-0 z-40 bg-white/90 backdrop-blur-md ${rc.border} transition-all`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className={`w-8 h-8 ${rc.logoBg} ${rc.logoHover} rounded-xl flex items-center justify-center shadow-sm transition-colors`}>
              <span className="text-white font-display text-sm font-bold leading-none">S</span>
            </div>
            <span className="font-display font-700 text-slate-900 text-base tracking-tight hidden sm:block">
              SkillMarket
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center">
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
          </nav>

          {/* Right area */}
          <div className="flex items-center gap-1.5">
            {user ? (
              <>
                {/* Messages */}
                <Link
                  to="/messages"
                  className="relative p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors hidden sm:flex"
                  title="Messages"
                >
                  <MessageSquare size={17} />
                </Link>

                {/* Notifications */}
                <Link
                  to="/notifications"
                  className="relative p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Notifications"
                >
                  {unreadCount > 0
                    ? <BellRing size={17} className={rc.bellActive} />
                    : <Bell size={17} />
                  }
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-1 leading-none shadow-sm">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Profile */}
                <Link
                  to="/profile"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors hidden sm:flex"
                  title="My Profile"
                >
                  <User size={17} />
                </Link>

                {/* Role badge */}
                <span className={`hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm ${rc.badge}`}>
                  {rc.badgeLabel}
                </span>

                {/* Name */}
                <span className="text-sm font-medium text-slate-700 hidden lg:block pl-1 pr-0.5">{user.name}</span>

                {/* Logout */}
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors hidden sm:flex"
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
                  <Button variant="secondary" size="sm">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Sign up</Button>
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
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{user.name}</p>
                    <p className="text-white/70 text-xs">{user.email}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between px-4 h-14 border-b border-slate-100">
                <span className="font-display font-700 text-slate-900 text-base">SkillMarket</span>
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
                    <ChevronRight size={14} className="ml-auto opacity-30" />
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
                      <span className="ml-auto min-w-[18px] h-4.5 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                        {unreadCount}
                      </span>
                    )}
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
        `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
          isActive
            ? rc.navActive
            : `text-slate-500 ${rc.navHover} ${roleSpecific ? 'font-medium' : ''}`
        }`
      }
    >
      {icon}
      {children}
    </RouterNavLink>
  )
}


==============================================================
PART 3 — AUTH PAGES (split-screen premium layout)
==============================================================

--- FILE: frontend/src/pages/auth/Login.jsx ---
Give Login a full split-screen layout. Left panel = branding with gradient background, animated
taglines, floating skill tags. Right panel = the existing form logic, unchanged, but in a clean
centered panel. The split only shows on md+ screens. On mobile it's just the form with a nice header.

Replace the return JSX (keep all existing state/handlers exactly as-is) with:

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex">
      {/* Left branding panel — desktop only */}
      <div className="hidden md:flex md:w-5/12 lg:w-1/2 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 relative overflow-hidden flex-col justify-between p-10">
        <div className="grid-pattern absolute inset-0 opacity-100" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-white font-display text-base font-bold">S</span>
            </div>
            <span className="font-display font-700 text-white text-lg">SkillMarket</span>
          </div>
          <h2 className="font-display text-3xl lg:text-4xl font-700 text-white leading-tight mb-4">
            Where talent meets<br />opportunity.
          </h2>
          <p className="text-brand-200 text-base leading-relaxed max-w-xs">
            Post projects, swap skills, build your career — all in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {['React', 'Python', 'Laravel', 'UI Design', 'Node.js', 'Machine Learning'].map(s => (
              <span key={s} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 text-white/80 border border-white/10">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-4 border border-white/10">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">A</div>
            <div>
              <p className="text-white text-sm font-medium">"Got my first freelance project within a week!"</p>
              <p className="text-brand-300 text-xs mt-0.5">Ali Hassan · Full-Stack Developer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 bg-slate-50">
        <div className="w-full max-w-md animate-fade-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 md:hidden">
            <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-display text-sm font-bold">S</span>
            </div>
            <span className="font-display font-700 text-slate-900 text-base">SkillMarket</span>
          </div>

          <div className="mb-7">
            <h2 className="font-display text-2xl font-700 text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-slate-500 text-sm mt-1">Sign in to your account</p>
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-7">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <Input label="Email address" type="email" name="email" autoComplete="email"
                placeholder="you@example.com" value={form.email} onChange={set('email')} error={errors.email} />
              <Input label="Password" type="password" name="password" autoComplete="current-password"
                placeholder="••••••••" value={form.password} onChange={set('password')} error={errors.password} />
              <Button type="submit" loading={loading} className="w-full mt-1 py-3 text-base">
                Sign in <ArrowRight size={16} />
              </Button>
            </form>

            <div className="mt-5 pt-5 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
                  Create one free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )


--- FILE: frontend/src/pages/auth/Register.jsx ---
Same split-screen treatment. Left panel gradient. Right panel has the existing form.
Same pattern as Login — left branding with gradient, right form in a white card.
The left panel text: "Join 500+ students and employers already building their future."
Keep all existing form state, validation, and submit logic completely unchanged.


==============================================================
PART 4 — DASHBOARD (role-differentiated hero banners)
==============================================================

--- FILE: frontend/src/pages/dashboard/Dashboard.jsx ---

StudentDashboard: Add a gradient hero banner at the top:
  <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-student-500 via-student-600 to-brand-700 p-6 md:p-8 mb-2">
    <div className="grid-pattern absolute inset-0" />
    <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
      <div>
        <div className="inline-flex items-center gap-2 bg-white/15 rounded-xl px-3 py-1.5 mb-3">
          <span className="text-white/90 text-xs font-semibold">🎓 Student Dashboard</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-700 text-white leading-tight">
          Welcome back, {name}! 👋
        </h1>
        <p className="text-white/70 text-sm mt-1">Track your applications and discover new opportunities.</p>
      </div>
      <Link to="/projects">
        <button className="flex items-center gap-2 bg-white text-student-700 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-student-50 transition-colors shadow-sm">
          Browse Projects <ArrowRight size={15} />
        </button>
      </Link>
    </div>
  </div>

EmployerDashboard: Add a gradient hero banner:
  <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-employer-500 via-employer-600 to-employer-800 p-6 md:p-8 mb-2">
    <div className="grid-pattern absolute inset-0" />
    <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
      <div>
        <div className="inline-flex items-center gap-2 bg-white/15 rounded-xl px-3 py-1.5 mb-3">
          <span className="text-white/90 text-xs font-semibold">🏢 Employer Dashboard</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-700 text-white leading-tight">
          Welcome back, {name}! 👋
        </h1>
        <p className="text-white/70 text-sm mt-1">Manage your projects and review incoming talent.</p>
      </div>
      <Link to="/projects/create">
        <button className="flex items-center gap-2 bg-white text-employer-700 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-employer-50 transition-colors shadow-sm">
          <Plus size={15} /> Post Project
        </button>
      </Link>
    </div>
  </div>

AdminDashboard: Add a gradient hero banner:
  <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 p-6 md:p-8 mb-2">
    <div className="grid-pattern absolute inset-0" />
    <div className="relative z-10">
      <div className="inline-flex items-center gap-2 bg-white/15 rounded-xl px-3 py-1.5 mb-3">
        <span className="text-white/90 text-xs font-semibold">⚡ Admin Control Panel</span>
      </div>
      <h1 className="font-display text-2xl md:text-3xl font-700 text-white leading-tight">
        Platform Overview
      </h1>
      <p className="text-white/70 text-sm mt-1">Monitor users, projects, and platform health.</p>
    </div>
  </div>

PublicDashboard hero: Make it more dramatic:
  Replace plain white hero with:
  <div className="relative text-center py-20 px-4 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900">
    <div className="grid-pattern absolute inset-0" />
    <div className="absolute inset-0 bg-gradient-radial from-brand-600/30 via-transparent to-transparent" />
    <div className="relative z-10">
      ... (keep same heading text but with text-white and text-brand-300 for the colored span)
      ... buttons: primary button style gets white bg + brand text, secondary gets white/10 bg
    </div>
  </div>

StatCard upgrade: In StatCard.jsx, add a subtle left border accent:
  Change the card div to:
  <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-5 flex items-center gap-4 hover:shadow-card-hover transition-all duration-200 group">
  Make the value text larger: text-3xl
  Add trend-style underline glow on the icon container on hover


==============================================================
PART 5 — COMPONENT UPGRADES
==============================================================

--- FILE: frontend/src/components/ui/Button.jsx ---
Add a new 'employer' and 'student' variant. Upgrade existing primary button with subtle gradient.
Replace variants object with:
const variants = {
  primary:   'bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white shadow-sm shadow-brand-200/60',
  secondary: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm',
  danger:    'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-sm shadow-red-200/60',
  ghost:     'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  employer:  'bg-gradient-to-r from-employer-500 to-employer-600 hover:from-employer-600 hover:to-employer-700 text-white shadow-sm shadow-employer-200/60',
  student:   'bg-gradient-to-r from-student-500 to-student-600 hover:from-student-600 hover:to-student-700 text-white shadow-sm shadow-student-200/60',
}

Also add a size prop properly:
const sizes = {
  sm: 'px-3.5 py-1.5 text-xs rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
}
Default size = 'md'. Apply sizes[size] in className.


--- FILE: frontend/src/components/ui/StatCard.jsx ---
Upgrade to add left colored border and hover effect:
export default function StatCard({ title, value, icon: Icon, color = 'blue' }) {
  const c = colorMap[color] || colorMap.blue
  return (
    <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-5 flex items-center gap-4 hover:shadow-card-hover transition-all duration-200 group relative overflow-hidden">
      {/* Subtle top gradient */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${c.bar}`} />
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${c.bg} group-hover:scale-105 transition-transform`}>
        {Icon && <Icon size={22} className={c.icon} />}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-display font-700 text-slate-900 leading-tight mt-0.5">{value ?? '—'}</p>
      </div>
    </div>
  )
}

Add 'bar' to colorMap entries: e.g. blue: { bg: 'bg-blue-50', icon: 'text-blue-600', bar: 'bg-blue-500' }


--- FILE: frontend/src/components/ProjectCard.jsx ---
Upgrade the card with better hover, employer name badge, cleaner layout:
- Add group class to outer div
- Title should be Link with group-hover:text-brand-600
- Employer name: show as a small pill badge "Posted by X" with a Building icon
- Skills: show max 4, "+N more" if overflow
- Budget: make it stand out with a green pill with $ icon
- Footer: add a subtle arrow that appears on hover
- Card shadow on hover: shadow-card-hover


--- FILE: frontend/src/components/SkillSwapCard.jsx ---
Upgrade with:
- Arrow-exchange icon between teach and learn skills
- User avatar using colorFor utility (import from utils/format)
- A "skills exchange" visual: two colored pills with a ↔ arrow between them
- On hover: slight lift (hover:-translate-y-0.5 transition-transform)


==============================================================
PART 6 — PAGE-LEVEL VISUAL UPGRADES
==============================================================

--- FILE: frontend/src/pages/projects/ProjectList.jsx ---
- Add a proper page header section with a gradient pill badge "Browse Opportunities"
- Filter bar: give it a card style with proper shadow (not just bg-white flat)
- Add a "No results" illustration using a simple SVG or emoji-based empty state

--- FILE: frontend/src/pages/projects/ProjectDetail.jsx ---
- The breadcrumb: style it as a real pill breadcrumb with chevrons
- Project title area: give it a hero-like treatment with a light gradient background card
- Sidebar info card: add icons with colored backgrounds for each stat
- Apply button: use the student variant (sky blue) when shown
- ApplicationsSection: zebra-stripe the table rows, add avatar initials for student names

--- FILE: frontend/src/pages/skillswap/SkillSwap.jsx ---
- Tab switcher: upgrade to pill-style tabs with role color (student=sky, employer=violet)
- Browse grid: keep 3-col but add a search bar at the top of the Browse tab
- My Listings: cards should have cleaner toggle with a proper switch-like control
- Requests tab: incoming requests in a distinct card with green/red action buttons that are more prominent

--- FILE: frontend/src/pages/profile/Profile.jsx ---
- Profile header: give it a gradient banner (subtle, light version of role color) behind the avatar area
- Avatar circle: make it 24x24 w-24 h-24, add a ring border in role color
- Edit mode: float the Save/Cancel as a sticky bottom bar on mobile
- Skills section: make tags more pill-like with hover effects

--- FILE: frontend/src/pages/profile/PublicProfile.jsx ---
- Same gradient banner treatment as own Profile
- If the user is a student: banner uses student gradient
- If employer: employer gradient
- Rating stars: use filled SVG stars (gold) not Unicode
- Message button: use employer or student variant color of Button

--- FILE: frontend/src/pages/messages/Conversation.jsx ---
- Own messages bubble: use brand gradient bg (from-brand-500 to-brand-600)
- Other person's messages: bg-slate-100
- Header bar: show the other person's role badge colored correctly
- Input area: give the textarea a cleaner focus state with role-colored ring

--- FILE: frontend/src/pages/notifications/Notifications.jsx ---
- Unread notifications: give them a left border in role color, not just bg-blue-50
- Each notification row: add a subtle icon container (colored circle) matching the notification type

--- FILE: frontend/src/pages/admin/AdminDashboard.jsx ---
- Stat cards: admin color scheme (amber/orange)
- Recent users table: add avatar initials colored by role
- Recent projects: add status pill with proper colors
- Add a "Quick Actions" section with links to Manage Users and Manage Projects as gradient cards

--- FILE: frontend/src/pages/admin/AdminUsers.jsx ---
- Table: sticky header, hover rows, alternating subtle stripe
- Status column: show "Active" in green pill, "Suspended" in red pill
- Actions: group in a flex row with icon-only buttons (toggle=icon, delete=trash icon) with tooltips
- Add a search bar at the top to filter the user list

--- FILE: frontend/src/pages/admin/AdminProjects.jsx ---
- Same table upgrades as AdminUsers
- Add employer name column
- Status: color-coded pills


==============================================================
PART 7 — ROLE IDENTITY SUMMARY
==============================================================

The goal is that when a STUDENT is logged in:
- Navbar has a sky-blue bottom border
- Logo is sky blue
- Nav active states glow sky blue
- Role badge says "🎓 Student" in sky gradient
- Dashboard has a sky/brand gradient banner
- CTA buttons in student-specific pages use sky blue (student variant)
- Profile banner has a light sky gradient

When an EMPLOYER is logged in:
- Navbar has a violet bottom border
- Logo is violet
- Nav active states glow violet
- Role badge says "🏢 Employer" in violet gradient
- Dashboard has a violet/indigo gradient banner
- CTA buttons in employer-specific pages (Post Project, Manage) use violet (employer variant)
- Profile banner has a light violet gradient

When ADMIN is logged in:
- Navbar has an amber bottom border
- Logo is amber
- Everything amber/orange accented
- Dashboard has amber/orange gradient banner
- Admin panel cards use amber stat colors


==============================================================
ADMIN LOGIN CREDENTIALS
==============================================================
URL: http://localhost:5173 (or your deployed URL)
Email:    admin@skillmarket.com
Password: password

Other demo accounts (all password: password):
Student 1:  ali@student.com
Student 2:  sara@student.com
Student 3:  zara@student.com
Student 4:  hassan@student.com
Employer 1: employer@techcorp.com
Employer 2: employer@devstudio.pk


==============================================================
IMPORTANT RULES FOR THE AGENT
==============================================================
1. DO NOT change any API calls, data fetching, state management, or route logic
2. DO NOT remove any existing functionality — only add/change visual markup
3. Keep all useEffect, useState, handlers, and API imports exactly as they are
4. Only modify: className strings, JSX structure for layout, and CSS files
5. When adding new Tailwind classes (student-*, employer-*), they are defined in tailwind.config.js
6. The font imports in index.css cover DM Sans and Syne — no new font CDN needed
7. Test that the app still works after changes — no broken renders
8. Add the grid-pattern class to the new hero sections (it's defined in index.css)
9. Role config object should be defined once in a util or at component level — not duplicated
10. The 'employer' and 'student' color scales MUST be added to tailwind.config.js first before using them
==============================================================
END OF PROMPT
==============================================================