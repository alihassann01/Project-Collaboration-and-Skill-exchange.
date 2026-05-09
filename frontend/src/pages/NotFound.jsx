import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="animate-fade-up flex flex-col items-center justify-center text-center py-20 px-6">
      {/* Large 404 */}
      <div className="relative mb-8">
        <span className="text-[140px] sm:text-[180px] font-display font-black text-slate-100 leading-none select-none">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl sm:text-6xl">🔍</span>
        </div>
      </div>

      <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
        Page Not Found
      </h1>
      <p className="text-slate-500 text-sm sm:text-base max-w-md mb-8 leading-relaxed">
        The page you're looking for doesn't exist or has been moved.
        Let's get you back on track.
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        <Link to="/dashboard">
          <Button variant="primary" size="md">
            <Home size={15} /> Go to Dashboard
          </Button>
        </Link>
        <button onClick={() => window.history.back()}>
          <Button variant="secondary" size="md">
            <ArrowLeft size={15} /> Go Back
          </Button>
        </button>
      </div>
    </div>
  )
}
