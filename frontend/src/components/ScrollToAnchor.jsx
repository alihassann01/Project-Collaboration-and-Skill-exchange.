import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToAnchor() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      return
    }

    const targetId = hash.slice(1)
    const timeout = window.setTimeout(() => {
      const target = document.getElementById(targetId)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      }
    }, 80)

    return () => window.clearTimeout(timeout)
  }, [pathname, hash])

  return null
}
