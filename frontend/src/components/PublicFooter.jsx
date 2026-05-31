import { Link } from 'react-router-dom'

const footerColumns = [
  {
    title: 'Product',
    links: [
      ['Project workflow', '/project-workflow#workflow'],
      ['Skill Swap', '/skill-swap-info#exchange-flow'],
      ['For students', '/for-students#student-journey'],
      ['For employers', '/for-employers#employer-benefits'],
    ],
  },
  {
    title: 'Resources',
    links: [
      ['About us', '/about#platform-values'],
      ['FAQs', '/#faqs'],
      ['Testimonials', '/#testimonials'],
      ['Our impact', '/#impact'],
    ],
  },
  {
    title: 'Account',
    links: [
      ['Create account', '/register'],
      ['Log in', '/login'],
      ['Reset password', '/forgot-password'],
    ],
  },
]

const socials = [
  ['LinkedIn', 'https://www.linkedin.com', LinkedInIcon],
  ['Instagram', 'https://www.instagram.com', InstagramIcon],
  ['Facebook', 'https://www.facebook.com', FacebookIcon],
  ['X', 'https://x.com', XIcon],
  ['YouTube', 'https://www.youtube.com', YouTubeIcon],
]

function FooterLink({ to, children }) {
  return (
    <Link to={to} className="text-white/72 hover:text-white transition-colors leading-relaxed">
      {children}
    </Link>
  )
}

export default function PublicFooter() {
  return (
    <footer className="bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1.8fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white text-slate-950 flex items-center justify-center shadow-card">
                <span className="font-display text-2xl font-bold leading-none">S</span>
              </div>
              <span className="font-display text-4xl md:text-5xl font-bold tracking-tight">
                Skill<span className="text-emerald-300">Market</span>
              </span>
            </Link>

            <p className="mt-6 max-w-sm text-white/64 leading-relaxed">
              Project work, peer learning, and trusted reviews for students and employers.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              {socials.map(([label, href, Icon]) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-xl border border-white/15 text-white/82 hover:text-white hover:border-white/35 hover:bg-white/10 transition-all flex items-center justify-center"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-9 md:gap-12">
            {footerColumns.map(column => (
              <div key={column.title}>
                <h2 className="font-display text-2xl font-bold text-white">{column.title}</h2>
                <div className="mt-6 grid gap-4 text-base">
                  {column.links.map(([label, to]) => (
                    <FooterLink key={label} to={to}>{label}</FooterLink>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/18 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <p className="max-w-xl text-sm text-white/64 leading-relaxed">
            Built for early career project experience, practical skill exchange, and clearer collaboration signals.
          </p>

          <div className="flex flex-col gap-3 md:items-end">
            <p className="text-sm text-white/64">&copy; 2026 SkillMarket. All rights reserved.</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <FooterLink to="/about">Company</FooterLink>
              <FooterLink to="/project-workflow#workflow">Product</FooterLink>
              <FooterLink to="/register">Get started</FooterLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

function BrandIcon({ children }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
      {children}
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <BrandIcon>
      <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.28 8.28h4.44V23H.28V8.28ZM8.2 8.28h4.26v2.01h.06c.59-1.12 2.04-2.3 4.2-2.3 4.49 0 5.32 2.96 5.32 6.81V23H17.6v-7.27c0-1.73-.03-3.96-2.41-3.96-2.42 0-2.79 1.89-2.79 3.84V23H8.2V8.28Z" />
    </BrandIcon>
  )
}

function InstagramIcon() {
  return (
    <BrandIcon>
      <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.25-2.65a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3Z" />
    </BrandIcon>
  )
}

function FacebookIcon() {
  return (
    <BrandIcon>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06C2 17.08 5.66 21.25 10.44 22v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.23.2 2.23.2v2.47h-1.25c-1.24 0-1.63.78-1.63 1.57v1.89h2.77l-.44 2.91h-2.33V22C18.34 21.25 22 17.08 22 12.06Z" />
    </BrandIcon>
  )
}

function XIcon() {
  return (
    <BrandIcon>
      <path d="M18.9 2h3.1l-6.77 7.74L23.2 22h-6.24l-4.89-6.39L6.48 22H3.36l7.24-8.28L2.96 2h6.4l4.42 5.84L18.9 2Zm-1.09 17.84h1.72L8.42 4.05H6.58l11.23 15.79Z" />
    </BrandIcon>
  )
}

function YouTubeIcon() {
  return (
    <BrandIcon>
      <path d="M23.5 7.2a3 3 0 0 0-2.1-2.12C19.55 4.58 12 4.58 12 4.58s-7.55 0-9.4.5A3 3 0 0 0 .5 7.2 31.22 31.22 0 0 0 0 12.94a31.22 31.22 0 0 0 .5 5.74 3 3 0 0 0 2.1 2.12c1.85.5 9.4.5 9.4.5s7.55 0 9.4-.5a3 3 0 0 0 2.1-2.12 31.22 31.22 0 0 0 .5-5.74 31.22 31.22 0 0 0-.5-5.74ZM9.55 16.5V9.38l6.27 3.56-6.27 3.56Z" />
    </BrandIcon>
  )
}
