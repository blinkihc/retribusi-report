/**
 * Footer Component
 *
 * Footer dengan copyright dan link ke Tigasama
 * Created: 2025-11-25
 */

interface FooterProps {
  className?: string
  variant?: 'default' | 'mobile'
}

export function Footer({ className = '', variant = 'default' }: FooterProps) {
  const currentYear = new Date().getFullYear()

  if (variant === 'mobile') {
    // Mobile variant - positioned above bottom navigation
    return (
      <footer
        className={`py-2 px-4 text-center bg-slate-50 border-t border-slate-200 ${className}`}
      >
        <p className="text-[10px] text-slate-500">
          © {currentYear} Sisretda by{' '}
          <a
            href="https://tigasama.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
          >
            Tigasama
          </a>
          . All rights reserved.
        </p>
      </footer>
    )
  }

  // Default variant
  return (
    <footer className={`py-4 text-center ${className}`}>
      <p className="text-xs text-slate-500">
        © {currentYear} Sisretda by{' '}
        <a
          href="https://tigasama.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
        >
          Tigasama
        </a>
        . All rights reserved.
      </p>
    </footer>
  )
}
