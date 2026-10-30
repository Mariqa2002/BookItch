import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * Page-flip transition: each new page rotates in from the right edge
 * like a page of a book turning, and the outgoing page rotates away
 * to the left. Kept subtle per the brief — a small rotation (10deg),
 * short duration (0.38s), not a literal 90deg flip, so it reads as a
 * page turn rather than a disorienting 3D tumble.
 */
const pageVariants = {
  initial: { opacity: 0, rotateY: -8, x: 18 },
  animate: { opacity: 1, rotateY: 0, x: 0 },
  exit: { opacity: 0, rotateY: 8, x: -18 },
}

export function PageTransition({ pathKey, children }: { pathKey: string; children: ReactNode }) {
  return (
    <div className="bk-page-flip-stage">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathKey}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
