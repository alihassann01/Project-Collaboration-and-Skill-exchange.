import { Link } from 'react-router-dom'
import {
  ArrowRight, Briefcase, GraduationCap, Building2, ArrowLeftRight,
  CheckCircle, Users, MessageSquare, ShieldCheck, Sparkles, FileText,
  Target, CalendarDays, Award, BookOpen, ClipboardCheck, Clock,
  Layers, Lightbulb, Search, Send, Star, Trophy, UserCheck,
} from 'lucide-react'
import Button from '../../components/ui/Button'

const images = {
  home: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1600&q=85',
  about: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=85',
  projects: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1600&q=85',
  swap: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=85',
  students: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=85',
  employers: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=85',
}

function Hero({ image, eyebrow, icon, title, text, primary = 'Create account', secondary = 'Log in' }) {
  return (
    <section className="editorial-hero min-h-[520px]">
      <img src={image} alt="" className="editorial-image" />
      <div className="absolute inset-0 editorial-overlay" />
      <div className="relative z-10 min-h-[520px] flex items-center px-6 md:px-12 py-12">
        <div className="max-w-3xl">
          <div className="eyebrow-pill mb-6">
            {icon} {eyebrow}
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white tracking-tight leading-[0.96]">
            {title}
          </h1>
          <p className="mt-6 text-white/78 text-lg md:text-xl max-w-2xl leading-relaxed">
            {text}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register">
              <Button variant="secondary" size="lg" className="public-cta-primary">
                {primary} <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="lg" className="bg-white/10 border border-white/25 text-white hover:bg-white/20 hover:text-white">
                {secondary}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function StepCard({ icon, title, text, index }) {
  return (
    <div className="market-card p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-display font-bold">
          {index}
        </div>
        <div className="flex-1">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
            {icon}
          </div>
          <h3 className="font-display text-2xl font-bold text-slate-950">{title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed mt-2">{text}</p>
        </div>
      </div>
    </div>
  )
}

function FeatureBand({ title, text, image, points }) {
  return (
    <section className="grid lg:grid-cols-2 gap-8 items-stretch">
      <div className="rounded-5xl overflow-hidden min-h-[360px] shadow-elevated">
        <img src={image} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="panel-card rounded-5xl p-8 md:p-10 flex flex-col justify-center">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-950 leading-tight">{title}</h2>
        <p className="text-slate-600 leading-relaxed mt-4">{text}</p>
        <div className="mt-7 grid gap-3">
          {points.map(point => (
            <div key={point} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
              <CheckCircle size={18} className="text-emerald-600" />
              {point}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SectionHeading({ eyebrow, title, text, align = 'center' }) {
  return (
    <div className={`${align === 'center' ? 'mx-auto text-center' : ''} max-w-3xl`}>
      <p className="section-label mb-3">{eyebrow}</p>
      <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-950 leading-tight">{title}</h2>
      {text && <p className="mt-4 text-slate-600 leading-relaxed">{text}</p>}
    </div>
  )
}

function MiniFeature({ icon, title, text }) {
  return (
    <div className="market-card p-6">
      <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center mb-5">
        {icon}
      </div>
      <h3 className="font-display text-xl font-bold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{text}</p>
    </div>
  )
}

function AnimatedCard({ children, delay = 0, className = '' }) {
  return (
    <div className={`animate-fade-up ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

function MetricStrip({ stats }) {
  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(([value, label], index) => (
        <AnimatedCard key={label} delay={index * 70} className="panel-card rounded-4xl p-6 text-center">
          <p className="font-display text-3xl md:text-4xl font-bold text-slate-950">{value}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-400 font-bold leading-relaxed">{label}</p>
        </AnimatedCard>
      ))}
    </section>
  )
}

function IconGrid({ items, columns = 'md:grid-cols-2 xl:grid-cols-4' }) {
  return (
    <section className={`grid ${columns} gap-5`}>
      {items.map((item, index) => (
        <AnimatedCard key={item.title} delay={index * 80}>
          <MiniFeature {...item} />
        </AnimatedCard>
      ))}
    </section>
  )
}

function TimelineSection({ items }) {
  return (
    <section className="panel-card rounded-5xl p-6 md:p-8">
      <div className="grid lg:grid-cols-4 gap-5">
        {items.map((item, index) => (
          <div key={item.title} className="relative animate-fade-up" style={{ animationDelay: `${index * 80}ms` }}>
            <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-display font-bold mb-5">
              {item.step}
            </div>
            <h3 className="font-display text-xl font-bold text-slate-950">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function SplitStory({ eyebrow, title, text, image, points, reverse = false }) {
  return (
    <section className={`grid lg:grid-cols-2 gap-8 items-stretch ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}>
      <div className="rounded-5xl overflow-hidden min-h-[390px] shadow-elevated animate-float">
        <img src={image} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="panel-card rounded-5xl p-8 md:p-10 flex flex-col justify-center">
        <p className="section-label mb-3">{eyebrow}</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-950 leading-tight">{title}</h2>
        <p className="mt-4 text-slate-600 leading-relaxed">{text}</p>
        <div className="mt-7 grid gap-3">
          {points.map(point => (
            <div key={point} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
              <CheckCircle size={18} className="text-emerald-600 flex-shrink-0" />
              {point}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PageCTA({ title, text, primary = 'Create account', secondary = 'Log in', secondaryTo = '/login' }) {
  return (
    <section className="panel-card rounded-5xl p-8 md:p-10 bg-white/95">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="max-w-2xl">
          <p className="section-label mb-3">Next step</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-950 leading-tight">{title}</h2>
          <p className="mt-3 text-slate-600 leading-relaxed">{text}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/register">
            <Button variant="primary">{primary} <ArrowRight size={15} /></Button>
          </Link>
          <Link to={secondaryTo}>
            <Button variant="ghost">{secondary}</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

const impactStats = [
  ['250+', 'student profiles ready for project work'],
  ['80+', 'employer projects shaped for learning'],
  ['1.5K+', 'skill exchanges and applications tracked'],
  ['4.8/5', 'average collaboration feedback'],
]

const whyChooseUs = [
  {
    icon: <Briefcase size={22} />,
    title: 'Real project experience',
    text: 'Students do more than list skills. They apply, collaborate, finish work, and build proof employers can understand.',
  },
  {
    icon: <ArrowLeftRight size={22} />,
    title: 'Skill exchange built in',
    text: 'Learners can teach what they know, request what they need, and grow through peer-to-peer exchanges.',
  },
  {
    icon: <ShieldCheck size={22} />,
    title: 'Trust through reviews',
    text: 'Profiles, completed work, and ratings help both sides make confident decisions before they collaborate.',
  },
  {
    icon: <MessageSquare size={22} />,
    title: 'Simple coordination',
    text: 'Applications, messages, meeting links, and status updates keep the project flow organized from one place.',
  },
]

const testimonials = [
  {
    quote: 'SkillMarket helped me turn class projects into real portfolio stories. The application flow made it easy to show what I could contribute.',
    name: 'Ayesha Khan',
    role: 'Computer Science Student',
  },
  {
    quote: 'We posted a scoped project and quickly found students who were motivated, clear, and ready to learn by doing.',
    name: 'Omar Siddiqui',
    role: 'Startup Founder',
  },
  {
    quote: 'The skill swap feature made the platform feel alive. I taught design basics and learned React from another student.',
    name: 'Mina Patel',
    role: 'UX Learner',
  },
]

const faqs = [
  {
    question: 'Can visitors see project listings without logging in?',
    answer: 'Visitors can understand the workflow from public pages. Actual listings, applications, messages, and profiles stay inside the logged-in experience.',
  },
  {
    question: 'Who can use SkillMarket?',
    answer: 'Students use it to build experience and exchange skills. Employers use it to publish projects, review applicants, and coordinate collaboration.',
  },
  {
    question: 'How does Skill Swap work?',
    answer: 'A user lists what they can teach and what they want to learn, then connects with peers for a useful exchange.',
  },
  {
    question: 'Do reviews appear on profiles?',
    answer: 'Yes. Reviews help make completed work visible and give future collaborators more context.',
  },
]

const aboutValues = [
  { icon: <Lightbulb size={22} />, title: 'Learning by doing', text: 'Every public page points users toward project work, feedback, and useful skill growth.' },
  { icon: <Users size={22} />, title: 'Two-sided clarity', text: 'Students and employers get separate flows, language, and expectations before they join.' },
  { icon: <Award size={22} />, title: 'Visible progress', text: 'Reviews and profile activity help transform small collaborations into credible proof.' },
  { icon: <ShieldCheck size={22} />, title: 'Trust first', text: 'Protected tools, clear roles, and profile context reduce confusion when people collaborate.' },
]

const projectTimeline = [
  { step: '01', title: 'Shape the brief', text: 'An employer defines the problem, required skills, budget, duration, and deadline.' },
  { step: '02', title: 'Review applicants', text: 'Students apply with context so employers can compare interest, skills, and fit.' },
  { step: '03', title: 'Coordinate work', text: 'Messages and meeting links keep discussion connected to the project workflow.' },
  { step: '04', title: 'Close with proof', text: 'Completed work and reviews help both sides leave with visible outcomes.' },
]

const projectExamples = [
  { icon: <Search size={22} />, title: 'Research sprint', text: 'Market scans, competitor notes, customer discovery, and summarized insights.' },
  { icon: <Layers size={22} />, title: 'Product support', text: 'Wireframes, landing page audits, content drafts, and prototype feedback.' },
  { icon: <ClipboardCheck size={22} />, title: 'Operations task', text: 'Process mapping, documentation cleanup, simple automation, and reporting.' },
  { icon: <MessageSquare size={22} />, title: 'Community work', text: 'Campaign ideas, outreach lists, social content, and event support.' },
]

const swapSteps = [
  { step: '01', title: 'List both sides', text: 'Add what you can teach and what you want to learn so matches have context.' },
  { step: '02', title: 'Browse peers', text: 'Find people whose teaching and learning goals naturally fit your own.' },
  { step: '03', title: 'Request exchange', text: 'Send a focused request and agree on expectations before you start.' },
  { step: '04', title: 'Update profile', text: 'Skill activity becomes part of the larger story users can show later.' },
]

const swapIdeas = [
  { icon: <BookOpen size={22} />, title: 'Teach fundamentals', text: 'Share a tool, language, design method, or study habit you already use well.' },
  { icon: <Target size={22} />, title: 'Learn with purpose', text: 'Ask for a focused exchange tied to a project, portfolio goal, or course need.' },
  { icon: <Clock size={22} />, title: 'Keep it lightweight', text: 'Short sessions and clear goals make exchanges easier to finish.' },
  { icon: <Star size={22} />, title: 'Build credibility', text: 'Consistent learning activity supports a stronger public profile.' },
]

const studentJourney = [
  { step: '01', title: 'Discover direction', text: 'Understand the kinds of projects employers need and the skills attached to them.' },
  { step: '02', title: 'Apply with intent', text: 'Use applications to explain your interests, availability, and relevant strengths.' },
  { step: '03', title: 'Collaborate clearly', text: 'Use messages, meetings, and status updates to stay aligned during the work.' },
  { step: '04', title: 'Show outcomes', text: 'Turn completed projects, reviews, and skill swaps into stronger profile proof.' },
]

const studentProof = [
  { icon: <Trophy size={22} />, title: 'Portfolio stories', text: 'Use real tasks and reviews to describe what you did, not only what you studied.' },
  { icon: <UserCheck size={22} />, title: 'Employer context', text: 'Applications and completed work help employers understand your readiness.' },
  { icon: <ArrowLeftRight size={22} />, title: 'Peer learning', text: 'Skill Swap helps you keep growing even before you find the perfect project.' },
]

const employerBenefits = [
  { icon: <FileText size={22} />, title: 'Scoped project briefs', text: 'Describe deliverables, skills, timeframes, budget, and expectations clearly.' },
  { icon: <Users size={22} />, title: 'Motivated applicants', text: 'Review student applications from people looking for meaningful experience.' },
  { icon: <Send size={22} />, title: 'Easy coordination', text: 'Message students, share meeting links, and keep follow-up tied to the project.' },
  { icon: <Award size={22} />, title: 'Talent signal', text: 'Finished work and reviews help identify students you may want to work with again.' },
]

export function PublicHome() {
  return (
    <div className="animate-fade-up space-y-16">
      <Hero
        image={images.home}
        eyebrow="SkillMarket"
        icon={<Sparkles size={14} />}
        title="Real work, real skills, real progress."
        text="A project and skill exchange platform where students build experience and employers discover motivated talent."
      />

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ['Live', 'Project workflow'],
          ['Fast', 'Student applications'],
          ['Peer', 'Skill exchange'],
          ['Built-in', 'Messaging and reviews'],
        ].map(([value, label]) => (
          <div key={label} className="panel-card rounded-4xl p-6 text-center">
            <p className="font-display text-3xl md:text-4xl font-bold text-slate-950">{value}</p>
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400 font-bold mt-2">{label}</p>
          </div>
        ))}
      </section>

      <section className="space-y-8" id="impact">
        <SectionHeading
          eyebrow="Our impact"
          title="Built to turn learning into measurable progress."
          text="SkillMarket gives students, peers, and employers a shared place to move from interest to proof of work."
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {impactStats.map(([value, label]) => (
            <div key={label} className="panel-card rounded-4xl p-6 text-center">
              <p className="font-display text-4xl md:text-5xl font-bold text-slate-950">{value}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.14em] text-slate-400 font-bold leading-relaxed">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-8" id="why-choose-us">
        <SectionHeading
          eyebrow="Why choose us"
          title="Everything needed for project-based learning."
          text="The platform combines project discovery, skill exchange, messaging, reviews, and role-based dashboards in one practical workflow."
        />
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
          {whyChooseUs.map(feature => (
            <MiniFeature key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <section className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 items-stretch" id="about">
        <div className="rounded-5xl overflow-hidden min-h-[420px] shadow-elevated">
          <img src={images.about} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="panel-card rounded-5xl p-8 md:p-10 flex flex-col justify-center">
          <p className="section-label mb-3">About us</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-950 leading-tight">
            Bridging students, skills, and real employer needs.
          </h2>
          <p className="mt-4 text-slate-600 leading-relaxed">
            SkillMarket is designed for learners who need real experience and employers who need motivated talent.
            Students can apply to projects, exchange skills, collect reviews, and grow profiles around actual work.
          </p>
          <div className="mt-7 grid sm:grid-cols-2 gap-3">
            {['Project applications', 'Skill swap listings', 'Messaging and meetings', 'Profile reviews'].map(point => (
              <div key={point} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <CheckCircle size={18} className="text-emerald-600" />
                {point}
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/about">
              <Button variant="primary">Learn about us <ArrowRight size={15} /></Button>
            </Link>
            <Link to="/project-workflow">
              <Button variant="ghost">See workflow</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-3 gap-6">
        {[
          ['Project marketplace', 'Learn how projects move from posting to applications, review, meetings, and completion.', images.projects, <Briefcase size={28} className="text-brand-600" />, '/project-workflow'],
          ['Skill Swap', 'See how students can teach one skill, learn another, and request exchanges with peers.', images.swap, <ArrowLeftRight size={28} className="text-emerald-600" />, '/skill-swap-info'],
          ['For employers', 'Understand how employers publish work, review applicants, and collaborate with students.', images.employers, <Building2 size={28} className="text-violet-600" />, '/for-employers'],
        ].map(([title, text, img, icon, to]) => (
          <Link key={title} to={to} className="market-card group">
            <div className="relative h-56 overflow-hidden">
              <img src={img} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 to-transparent" />
              <div className="absolute left-5 bottom-5 w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-card">{icon}</div>
            </div>
            <div className="p-6">
              <h3 className="font-display text-2xl font-bold text-slate-950">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mt-2">{text}</p>
              <span className="inline-flex items-center gap-1 text-sm font-bold text-brand-600 mt-5">Learn more <ArrowRight size={14} /></span>
            </div>
          </Link>
        ))}
      </section>

      <section className="space-y-8" id="testimonials">
        <SectionHeading
          eyebrow="Client testimonials"
          title="Trusted by learners and project teams."
          text="A public home page should make the value feel concrete before someone creates an account."
        />
        <div className="grid lg:grid-cols-3 gap-5">
          {testimonials.map(item => (
            <article key={item.name} className="market-card p-6 flex flex-col">
              <div className="flex items-center gap-1 text-amber-400 mb-5">
                {[1, 2, 3, 4, 5].map(star => (
                  <Sparkles key={star} size={15} fill="currentColor" />
                ))}
              </div>
              <p className="text-slate-600 leading-relaxed flex-1">"{item.quote}"</p>
              <div className="mt-6 pt-5 border-t border-slate-100">
                <p className="font-display font-bold text-slate-950">{item.name}</p>
                <p className="text-sm text-slate-400">{item.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-8" id="faqs">
        <SectionHeading
          eyebrow="FAQs"
          title="Answers before sign up."
          text="Keep the guest experience clear while the working tools stay protected behind login."
        />
        <div className="grid md:grid-cols-2 gap-4">
          {faqs.map(item => (
            <div key={item.question} className="panel-card rounded-4xl p-6">
              <h3 className="font-display text-xl font-bold text-slate-950">{item.question}</h3>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="editorial-hero min-h-[320px]">
        <img src={images.students} alt="" className="editorial-image" />
        <div className="absolute inset-0 editorial-overlay" />
        <div className="relative z-10 min-h-[320px] flex flex-col md:flex-row md:items-center md:justify-between gap-6 px-6 md:px-10 py-10">
          <div className="max-w-2xl">
            <p className="eyebrow-pill mb-5"><CalendarDays size={14} /> Start now</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">
              Ready to turn skills into visible work?
            </h2>
            <p className="mt-4 text-white/75 leading-relaxed">
              Join as a student or employer and move from introductions to organized collaboration.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link to="/register">
              <Button variant="secondary" size="lg" className="public-cta-primary">
                Sign up free <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="lg" className="bg-white/10 border border-white/25 text-white hover:bg-white/20 hover:text-white">
                Log in
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}

export function PublicAbout() {
  return (
    <div className="animate-fade-up space-y-16">
      <Hero
        image={images.about}
        eyebrow="About SkillMarket"
        icon={<Users size={14} />}
        title="Bridging learning with practical work."
        text="SkillMarket is built for a simple goal: help learners prove what they can do and help employers find people ready to contribute."
      />
      <MetricStrip
        stats={[
          ['2 roles', 'student and employer experiences'],
          ['4 flows', 'projects, swaps, messages, reviews'],
          ['1 place', 'for collaboration history'],
          ['Always', 'focused on practical proof'],
        ]}
      />
      <SplitStory
        eyebrow="What we believe"
        title="Profiles should be built from action, not empty claims."
        text="A student profile becomes more convincing when it is connected to applications, skill exchanges, completed work, and feedback. SkillMarket brings those signals together so users can build a record of useful effort."
        image={images.students}
        points={['Students apply with context', 'Employers manage applicants', 'Profiles grow from real activity', 'Reviews build trust']}
      />
      <section className="space-y-8" id="platform-values">
        <SectionHeading
          eyebrow="Platform values"
          title="The public pages explain the promise. The app helps users do the work."
          text="Each part of SkillMarket is designed to remove friction from early professional collaboration."
        />
        <IconGrid items={aboutValues} />
      </section>
      <section className="grid lg:grid-cols-[1fr_0.9fr] gap-8 items-stretch">
        <div className="panel-card rounded-5xl p-8 md:p-10">
          <p className="section-label mb-3">How it comes together</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-950 leading-tight">
            A learning marketplace with a practical operating layer.
          </h2>
          <div className="mt-8 grid gap-5">
            {[
              ['Explore', 'Visitors understand the platform, roles, and workflows before creating an account.'],
              ['Participate', 'Students apply to projects or open skill swaps while employers publish scoped work.'],
              ['Coordinate', 'Messages, meetings, and dashboards keep work moving after a match.'],
              ['Build proof', 'Reviews and profile activity turn completed work into stronger credibility.'],
            ].map(([title, text], index) => (
              <div key={title} className="flex gap-4 animate-slide-in-right" style={{ animationDelay: `${index * 70}ms` }}>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-display font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-950">{title}</h3>
                  <p className="mt-1 text-sm text-slate-500 leading-relaxed">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="editorial-hero min-h-[420px]">
          <img src={images.home} alt="" className="editorial-image" />
          <div className="absolute inset-0 editorial-overlay" />
          <div className="relative z-10 h-full min-h-[420px] flex flex-col justify-end p-8">
            <p className="eyebrow-pill mb-4"><Sparkles size={14} /> Built for momentum</p>
            <h3 className="font-display text-3xl font-bold text-white leading-tight">
              The goal is simple: make skill growth easier to see.
            </h3>
          </div>
        </div>
      </section>
      <PageCTA
        title="See the workflow that powers the platform."
        text="Project pages show how employers post work and how students move from application to review."
        secondary="View projects"
        secondaryTo="/project-workflow"
      />
    </div>
  )
}

export function PublicProjectWorkflow() {
  return (
    <div className="animate-fade-up space-y-16">
      <Hero
        image={images.projects}
        eyebrow="Project workflow"
        icon={<Briefcase size={14} />}
        title="See how projects work before you sign in."
        text="The public page explains the workflow only. Actual project listings, details, and applications are available after login."
      />
      <section className="space-y-8" id="workflow">
        <SectionHeading
          eyebrow="Workflow"
          title="A project moves through clear stages."
          text="The structure follows the same idea as work-based learning platforms: scope a real challenge, match with learners, coordinate the work, and close with feedback."
        />
        <TimelineSection items={projectTimeline} />
      </section>
      <SplitStory
        eyebrow="Project brief"
        title="Good collaboration starts with a useful scope."
        text="Before a student applies, the project should explain the outcome, the skills involved, what success looks like, and how long the work is expected to take."
        image={images.projects}
        points={['Problem statement and deliverables', 'Required skills and project category', 'Budget, deadline, and duration', 'Application context from students']}
      />
      <section className="space-y-8">
        <SectionHeading
          eyebrow="Example project types"
          title="Public visitors can understand the kind of work before logging in."
          text="These examples help students picture useful contributions and help employers think in focused project briefs."
        />
        <IconGrid items={projectExamples} />
      </section>
      <section className="grid lg:grid-cols-3 gap-5">
        {[
          ['Applicant view', 'Students can evaluate the work, prepare a focused application, and explain why they fit.'],
          ['Employer view', 'Employers can compare applicants, start conversations, and keep project details organized.'],
          ['Outcome view', 'Completed work and reviews become signals that support future collaboration.'],
        ].map(([title, text], index) => (
          <AnimatedCard key={title} delay={index * 90} className="panel-card rounded-4xl p-6">
            <p className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center font-display font-bold mb-5">
              {index + 1}
            </p>
            <h3 className="font-display text-2xl font-bold text-slate-950">{title}</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">{text}</p>
          </AnimatedCard>
        ))}
      </section>
      <PageCTA
        title="Ready to create or apply to real projects?"
        text="Create an account to access listings, applications, messages, and reviews."
        secondary="For employers"
        secondaryTo="/for-employers"
      />
    </div>
  )
}

export function PublicSkillSwapInfo() {
  return (
    <div className="animate-fade-up space-y-16">
      <Hero
        image={images.swap}
        eyebrow="Skill Swap"
        icon={<ArrowLeftRight size={14} />}
        title="Teach one skill. Learn another."
        text="Skill Swap helps users list what they can teach and what they want to learn, then request exchanges with the right people."
      />
      <section className="grid lg:grid-cols-[0.95fr_1.05fr] gap-8 items-stretch">
        <div className="panel-card rounded-5xl p-8 md:p-10">
          <p className="section-label mb-3">Matching idea</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-950 leading-tight">
            A skill exchange works best when both people know the trade.
          </h2>
          <p className="mt-4 text-slate-600 leading-relaxed">
            The listing pairs what someone can teach with what they want to learn, making the request more intentional than a generic message.
          </p>
          <div className="mt-8 grid gap-4">
            {[
              ['Can teach', 'JavaScript basics, Figma wireframes, resume review'],
              ['Wants to learn', 'Laravel APIs, presentation skills, UI animation'],
              ['Best match', 'Clear goals, short sessions, mutual follow-up'],
            ].map(([title, text], index) => (
              <div key={title} className="rounded-3xl border border-slate-200/70 bg-slate-50/80 p-5 animate-slide-in-right" style={{ animationDelay: `${index * 80}ms` }}>
                <p className="text-xs uppercase tracking-[0.14em] font-bold text-slate-400">{title}</p>
                <p className="mt-2 text-sm font-semibold text-slate-700">{text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="editorial-hero min-h-[500px]">
          <img src={images.swap} alt="" className="editorial-image" />
          <div className="absolute inset-0 editorial-overlay" />
          <div className="relative z-10 min-h-[500px] flex items-end p-8">
            <div className="grid gap-4 w-full">
              {['Teach React components', 'Learn portfolio writing', 'Swap for 2 focused sessions'].map((item, index) => (
                <div key={item} className="floating-card animate-fade-up" style={{ animationDelay: `${index * 110}ms` }}>
                  <div className="flex items-center gap-3 text-white font-semibold">
                    <CheckCircle size={18} className="text-emerald-200" />
                    {item}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="space-y-8" id="exchange-flow">
        <SectionHeading
          eyebrow="Exchange flow"
          title="From listing to useful peer learning."
          text="Skill Swap adds movement to the platform even when a user is not actively applying to projects."
        />
        <TimelineSection items={swapSteps} />
      </section>
      <SplitStory
        eyebrow="Profile connection"
        title="A peer learning loop that updates profiles."
        text="When users open listings, those teach and learn skills become part of their public profile. When a listing is deleted, the profile stays clean and current."
        image={images.swap}
        points={['Create a teach and learn listing', 'Browse matching peers', 'Send requests and message', 'Build profile credibility']}
      />
      <section className="space-y-8">
        <SectionHeading
          eyebrow="Ways to use it"
          title="Small exchanges can still create real progress."
          text="The best swaps are specific, time-boxed, and tied to something the learner is trying to build."
        />
        <IconGrid items={swapIdeas} />
      </section>
      <PageCTA
        title="Use skill exchange as your practice engine."
        text="Create an account to list what you can teach and find what you want to learn."
        secondary="For students"
        secondaryTo="/for-students"
      />
    </div>
  )
}

export function PublicForStudents() {
  return (
    <div className="animate-fade-up space-y-16">
      <Hero
        image={images.students}
        eyebrow="For students"
        icon={<GraduationCap size={14} />}
        title="Build proof of skill before the job."
        text="Students can apply to projects, exchange skills with peers, collect reviews, and show a stronger profile."
      />
      <MetricStrip
        stats={[
          ['Apply', 'to scoped projects'],
          ['Swap', 'skills with peers'],
          ['Message', 'inside the workflow'],
          ['Earn', 'reviews and profile proof'],
        ]}
      />
      <section className="space-y-8" id="student-journey">
        <SectionHeading
          eyebrow="Student journey"
          title="Move from learning a skill to showing it clearly."
          text="Students need more than a blank profile. They need steps that turn effort into visible evidence."
        />
        <TimelineSection items={studentJourney} />
      </section>
      <SplitStory
        eyebrow="What students gain"
        title="Experience that can be explained in a portfolio or interview."
        text="Project work, skill swaps, and reviews help students talk about what they practiced, how they collaborated, and what they delivered."
        image={images.students}
        points={['Apply to real project briefs', 'Practice through peer exchanges', 'Coordinate professionally', 'Build a profile with activity and reviews']}
      />
      <section className="space-y-8">
        <SectionHeading
          eyebrow="Proof builders"
          title="Your profile gets stronger when it reflects real activity."
          text="Each feature supports a different kind of evidence: work, learning, communication, and feedback."
        />
        <IconGrid items={studentProof} columns="md:grid-cols-3" />
      </section>
      <section className="grid lg:grid-cols-2 gap-8 items-stretch">
        <div className="panel-card rounded-5xl p-8 md:p-10">
          <p className="section-label mb-3">Before applying</p>
          <h2 className="font-display text-4xl font-bold text-slate-950 leading-tight">Make your application easier to trust.</h2>
          <div className="mt-7 grid gap-4">
            {['Read the project brief carefully', 'Mention relevant skills and availability', 'Explain what you want to learn', 'Follow up professionally in messages'].map(item => (
              <div key={item} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <CheckCircle size={18} className="text-emerald-600" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="panel-card rounded-5xl p-8 md:p-10">
          <p className="section-label mb-3">After completion</p>
          <h2 className="font-display text-4xl font-bold text-slate-950 leading-tight">Turn the work into a story.</h2>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Save the project outcome, request feedback, and connect the work to the skills you want employers to notice next.
          </p>
          <div className="mt-8 rounded-4xl bg-slate-950 p-6 text-white animate-float">
            <p className="text-sm text-white/60">Profile signal</p>
            <p className="mt-2 font-display text-3xl font-bold">Completed project + review + skill growth</p>
          </div>
        </div>
      </section>
      <PageCTA
        title="Start building visible experience."
        text="Create a student account to apply to projects, swap skills, and collect reviews."
        secondary="Explore Skill Swap"
        secondaryTo="/skill-swap-info"
      />
    </div>
  )
}

export function PublicForEmployers() {
  return (
    <div className="animate-fade-up space-y-16">
      <Hero
        image={images.employers}
        eyebrow="For employers"
        icon={<Building2 size={14} />}
        title="Turn project needs into student collaboration."
        text="Employers can publish projects, manage applications, coordinate meetings, and discover motivated learners."
      />
      <MetricStrip
        stats={[
          ['Post', 'scoped project briefs'],
          ['Review', 'student applications'],
          ['Meet', 'with built-in coordination'],
          ['Rate', 'completed collaboration'],
        ]}
      />
      <SplitStory
        eyebrow="Employer workflow"
        title="A simple operating flow for project work."
        text="Post a project, receive applications, review candidates, coordinate through messages or meeting links, and keep every listing organized."
        image={images.projects}
        points={['Post scoped projects', 'Review student applications', 'Share meeting links', 'Track listings from the dashboard']}
      />
      <section className="space-y-8" id="employer-benefits">
        <SectionHeading
          eyebrow="Why employers use it"
          title="Useful student collaboration without a heavy hiring process."
          text="The platform is suited for focused work, portfolio-building opportunities, and early talent discovery."
        />
        <IconGrid items={employerBenefits} />
      </section>
      <section className="panel-card rounded-5xl p-8 md:p-10">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-8 items-start">
          <div>
            <p className="section-label mb-3">Project scope examples</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-950 leading-tight">
              Start with work that is clear, bounded, and useful.
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              A strong brief gives students enough context to contribute while keeping the expected outcome realistic.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              ['Marketing', 'Content calendar, campaign ideas, audience research'],
              ['Product', 'User feedback review, prototype testing, feature notes'],
              ['Operations', 'Documentation, process audit, simple workflow map'],
              ['Data', 'Spreadsheet cleanup, survey summary, dashboard outline'],
            ].map(([title, text], index) => (
              <div key={title} className="rounded-4xl border border-slate-200/70 bg-slate-50/80 p-5 animate-fade-up" style={{ animationDelay: `${index * 80}ms` }}>
                <h3 className="font-display text-xl font-bold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="grid lg:grid-cols-3 gap-5">
        {[
          ['Less blank-slate outreach', 'Students apply through a project context, so the conversation starts with the work.'],
          ['Clearer expectations', 'Budgets, deadlines, required skills, and meeting links keep collaboration practical.'],
          ['Reusable talent signal', 'Reviews help students grow while helping employers remember strong contributors.'],
        ].map(([title, text], index) => (
          <AnimatedCard key={title} delay={index * 90} className="market-card p-6">
            <div className="w-12 h-12 rounded-2xl bg-employer-50 text-employer-700 flex items-center justify-center mb-5">
              <Building2 size={22} />
            </div>
            <h3 className="font-display text-2xl font-bold text-slate-950">{title}</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">{text}</p>
          </AnimatedCard>
        ))}
      </section>
      <PageCTA
        title="Publish a focused project and meet motivated students."
        text="Create an employer account to post work, review applicants, and coordinate collaboration."
        secondary="See project workflow"
        secondaryTo="/project-workflow"
      />
    </div>
  )
}
