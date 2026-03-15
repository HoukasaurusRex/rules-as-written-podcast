import type { ReactNode } from 'react'
import { useDialog } from './hooks/useDialog'

interface Props {
  onClose: () => void
  onBackdropClick?: () => void
  labelledBy: string
  children: ReactNode
  className?: string
  overlayClassName?: string
}

const Modal = ({
  onClose,
  onBackdropClick,
  labelledBy,
  children,
  className = 'w-full max-w-sm rounded-[5px] border border-bg-lighter bg-bg-light p-space-6 shadow-lg',
  overlayClassName = 'fixed inset-0 z-50 flex items-center justify-center bg-overlay p-space-4',
}: Props) => {
  const { dialogProps } = useDialog(onClose)

  return (
    <div
      className={overlayClassName}
      onClick={(e) => { if (e.target === e.currentTarget) (onBackdropClick ?? onClose)() }}
      {...dialogProps}
      aria-labelledby={labelledBy}
    >
      <div className={className}>
        {children}
      </div>
    </div>
  )
}

export default Modal
