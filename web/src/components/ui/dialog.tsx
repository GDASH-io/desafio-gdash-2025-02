import * as React from "react"

export interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export interface DialogContentProps {
  children: React.ReactNode
}

export interface DialogHeaderProps {
  children: React.ReactNode
}

export interface DialogTitleProps {
  children: React.ReactNode
}

export interface DialogTriggerProps {
  asChild?: boolean
  children: React.ReactNode
}

const DialogContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({
  open: false,
  setOpen: () => {},
})

export function Dialog({ open = false, onOpenChange, children }: DialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(open)
  
  const setOpen = (newOpen: boolean) => {
    setInternalOpen(newOpen)
    onOpenChange?.(newOpen)
  }
  
  React.useEffect(() => {
    setInternalOpen(open)
  }, [open])
  
  return (
    <DialogContext.Provider value={{ open: internalOpen, setOpen }}>
      {children}
    </DialogContext.Provider>
  )
}

export function DialogTrigger({ asChild, children }: DialogTriggerProps) {
  const { setOpen } = React.useContext(DialogContext)
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: () => setOpen(true),
    })
  }
  
  return (
    <button onClick={() => setOpen(true)}>
      {children}
    </button>
  )
}

export function DialogContent({ children }: DialogContentProps) {
  const { open, setOpen } = React.useContext(DialogContext)
  
  if (!open) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => setOpen(false)}
      />
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4 z-10">
        <button 
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  )
}

export function DialogHeader({ children }: DialogHeaderProps) {
  return (
    <div className="mb-4">
      {children}
    </div>
  )
}

export function DialogTitle({ children }: DialogTitleProps) {
  return (
    <h2 className="text-lg font-semibold text-gray-900">
      {children}
    </h2>
  )
}