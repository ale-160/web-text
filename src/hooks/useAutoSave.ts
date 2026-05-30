import { useEffect, useRef, useCallback } from 'react'

export function useAutoSave(content: string, onSave: () => void, delay = 3000) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevContentRef = useRef(content)

  const save = useCallback(() => {
    if (content !== prevContentRef.current) {
      onSave()
      prevContentRef.current = content
    }
  }, [content, onSave])

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    timerRef.current = setTimeout(save, delay)
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [content, delay, save])
}
