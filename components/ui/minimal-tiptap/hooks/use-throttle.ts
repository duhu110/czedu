import { useRef, useCallback } from "react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useThrottle<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const lastRan = useRef<number | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  return useCallback(
    (...args: Parameters<T>) => {
      const handler = () => {
        const now = Date.now()

        if (lastRan.current === null || now - lastRan.current >= delay) {
          callback(...args)
          lastRan.current = now
        } else {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
          }
          const remainingDelay = Math.max(delay - (now - lastRan.current), 0)
          timeoutRef.current = setTimeout(
            () => {
              callback(...args)
              lastRan.current = Date.now()
            },
            remainingDelay
          )
        }
      }

      handler()
    },
    [callback, delay]
  )
}
