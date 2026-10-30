import { cn } from '@/lib/cn'

/** Bookish.QuoteCard — .bk-quote from the design system. */
export function QuoteCard({ quote, author, className }: { quote: string; author: string; className?: string }) {
  return (
    <div className={cn('bk-quote', className)}>
      <p className="bk-quote__q">&ldquo;{quote}&rdquo;</p>
      <p className="bk-quote__a">{author}</p>
    </div>
  )
}
