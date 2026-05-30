export function countStats(text: string): { chars: number; words: number; lines: number } {
  const chars = text.length
  const lines = text ? text.split('\n').length : 0
  // Count words: Chinese characters count as words, English words split by spaces
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length
  const englishWords = text
    .replace(/[\u4e00-\u9fff]/g, '')
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 0).length
  const words = chineseChars + englishWords

  return { chars, words, lines }
}
