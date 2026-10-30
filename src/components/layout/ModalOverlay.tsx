import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Shared modal chrome for Settings and Add a Book — the dimmed
 * overlay + centered rounded panel from design/pages/settings.html,
 * generalised so both dialogs share one implementation.
 */
export function ModalOverlay({
  onClose,
  labelledBy,
  maxWidthClassName = 'max-w-[680px]',
  children,
}: {
  onClose: () => void
  labelledBy: string
  maxWidthClassName?: string
  children: ReactNode
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto px-4 py-6 sm:py-10"
        style={{ background: 'rgba(26, 15, 38, 0.55)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          className={`flex max-h-[85vh] w-full ${maxWidthClassName} flex-col overflow-hidden rounded-bk-xl bg-surface text-ink shadow-[0_24px_60px_rgba(26,15,38,0.35)]`}
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}
