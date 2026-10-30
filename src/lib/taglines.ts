/**
 * Small handwritten-style taglines for the book detail page footer
 * (design/pages/book.html shows one for its sample book, "Tiny habits
 * = big dreams" — kept verbatim for Atomic Habits; a generic pool
 * covers every other book, picked deterministically per book id).
 */
const GENERIC_TAGLINES = [
  'One page closer',
  'Chapter by chapter',
  'Worth the late night',
  'Every page counts',
  'Still turning pages',
]

export function taglineFor(bookId: string, title: string): string {
  if (title === 'Atomic Habits') return 'Tiny habits\n= big dreams'
  let hash = 0
  for (let i = 0; i < bookId.length; i++) hash = (hash * 31 + bookId.charCodeAt(i)) >>> 0
  return GENERIC_TAGLINES[hash % GENERIC_TAGLINES.length]
}
