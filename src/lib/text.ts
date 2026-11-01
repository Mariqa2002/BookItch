/** Capitalizes the first letter of every word ("initial caps"); leaves the rest of each word untouched. */
export function toInitialCaps(input: string): string {
  return input
    .trim()
    .split(/\s+/)
    .map((word) => (word.length === 0 ? word : word[0].toUpperCase() + word.slice(1)))
    .join(' ')
}
