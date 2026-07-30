import { PiCaretLeft, PiCaretRight } from 'react-icons/pi'
import { cn } from '@multi-tenants/utils'

function pageWindow(current, total, windowSize = 5) {
  if (total <= windowSize) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const half = Math.floor(windowSize / 2)
  let start = Math.max(1, current - half)
  let end = start + windowSize - 1

  if (end > total) {
    end = total
    start = Math.max(1, end - windowSize + 1)
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

export default function Pagination({
  page = 1,
  totalPages = 0,
  total = 0,
  limit = 6,
  onPageChange,
  className = '',
}) {
  if (totalPages <= 1) return null

  const pages = pageWindow(page, totalPages)
  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        'mt-12 flex flex-col items-center justify-between gap-4 border-t icon border-zinc-200 pt-8 sm:flex-row',
        className,
      )}
    >
      <p className="text-sm text-zinc-500">
        Showing <span className="font-medium text-zinc-800">{from}</span>–
        <span className="font-medium text-zinc-800">{to}</span> of{' '}
        <span className="font-medium text-zinc-800">{total}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange?.(page - 1)}
          className="normal-case inline-flex size-10 items-center justify-center border border-zinc-200 bg-white text-zinc-700 transition hover:border-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <PiCaretLeft className="icon size-4" />
        </button>

        {pages.map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`Page ${n}`}
            aria-current={n === page ? 'page' : undefined}
            onClick={() => onPageChange?.(n)}
            className={cn(
              'inline-flex size-10 items-center justify-center border text-sm font-medium transition',
              n === page
                ? 'border-zinc-900 bg-zinc-900 text-white'
                : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-900',
            )}
          >
            {n}
          </button>
        ))}

        <button
          type="button"
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() => onPageChange?.(page + 1)}
          className="inline-flex size-10 items-center justify-center border border-zinc-200 bg-white text-zinc-700 transition hover:border-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <PiCaretRight className="icon size-4" />
        </button>
      </div>
    </nav>
  )
}
