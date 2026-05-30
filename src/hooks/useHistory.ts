import { useState, useCallback } from 'react'

interface HistoryEntry {
  timestamp: number
  content: string
}

const MAX_HISTORY = 20
const STORAGE_KEY = 'webtext-history'

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const saveVersion = useCallback((currentContent: string) => {
    setHistory(prev => {
      // Don't save if content is same as last version
      if (prev.length > 0 && prev[0].content === currentContent) return prev

      const newEntry: HistoryEntry = {
        timestamp: Date.now(),
        content: currentContent,
      }
      const updated = [newEntry, ...prev].slice(0, MAX_HISTORY)
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch { /* ignore */ }
      return updated
    })
  }, [])

  const restoreVersion = useCallback((versionContent: string) => {
    return versionContent
  }, [])

  return { history, saveVersion, restoreVersion }
}
