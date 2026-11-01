// Best-effort chapter lookup via the Open Library API. Table-of-contents
// data only exists for a subset of editions, so coming back empty is the
// normal case, not an error — callers should treat it as "nothing found."

const REQUEST_TIMEOUT_MS = 6000

interface OpenLibrarySearchDoc {
  edition_key?: string[]
}

interface OpenLibraryTocEntry {
  title?: string
}

function timeoutSignal(ms: number): AbortSignal {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), ms)
  return controller.signal
}

async function fetchTocFromEdition(editionKey: string): Promise<string[]> {
  try {
    const res = await fetch(`https://openlibrary.org/books/${editionKey}.json`, {
      signal: timeoutSignal(REQUEST_TIMEOUT_MS),
    })
    if (!res.ok) return []
    const data = await res.json()
    const toc: OpenLibraryTocEntry[] | undefined = data?.table_of_contents
    if (!Array.isArray(toc)) return []
    return toc
      .map((entry) => entry.title?.trim())
      .filter((t): t is string => !!t && t.length > 1)
      .slice(0, 60)
  } catch {
    return []
  }
}

/** Looks up chapter titles for a book by title/author. Returns [] if none could be found. */
export async function fetchChapterTitles(title: string, author: string): Promise<string[]> {
  try {
    const query = new URLSearchParams({ title, author, limit: '1', fields: 'edition_key' })
    const searchRes = await fetch(`https://openlibrary.org/search.json?${query}`, {
      signal: timeoutSignal(REQUEST_TIMEOUT_MS),
    })
    if (!searchRes.ok) return []
    const searchData = await searchRes.json()
    const doc: OpenLibrarySearchDoc | undefined = searchData?.docs?.[0]
    const editionKeys = doc?.edition_key?.slice(0, 3) ?? []

    for (const editionKey of editionKeys) {
      const titles = await fetchTocFromEdition(editionKey)
      if (titles.length > 0) return titles
    }
    return []
  } catch {
    return []
  }
}
