import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  children: ReactNode
  className?: string
  id?: string
}

/** Reusable card container for grouped form sections. */
export function Card({ title, children, className = '', id }: CardProps) {
  return (
    <section
      id={id}
      className={`rounded-2xl border border-stitch-200/80 bg-white p-4 shadow-sm sm:p-5 dark:border-stitch-800 dark:bg-stitch-900/60 ${className}`}
      aria-labelledby={title ? `${id}-title` : undefined}
    >
      {title && (
        <h2
          id={`${id}-title`}
          className="mb-4 text-sm font-semibold uppercase tracking-wide text-stitch-600 dark:text-stitch-300"
        >
          {title}
        </h2>
      )}
      {children}
    </section>
  )
}
