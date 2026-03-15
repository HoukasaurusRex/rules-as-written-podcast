import { useEffect, useRef, useCallback } from 'react'

/**
 * Hook for accessible modal dialog behavior:
 * - Focus trap (Tab cycles within dialog)
 * - Escape key closes dialog
 * - Focus moves into dialog on mount, restores on unmount
 */
export function useDialog(onClose: () => void) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement

    // Focus first focusable element inside dialog
    const dialog = dialogRef.current
    if (dialog) {
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length) focusable[0].focus()
    }

    return () => {
      previousFocusRef.current?.focus()
    }
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        return
      }

      if (e.key !== 'Tab') return
      const dialog = dialogRef.current
      if (!dialog) return

      const focusable = dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    },
    [onClose],
  )

  const dialogProps = {
    ref: dialogRef,
    role: 'dialog' as const,
    'aria-modal': true as const,
    onKeyDown: handleKeyDown,
  }

  return { dialogRef, dialogProps }
}
