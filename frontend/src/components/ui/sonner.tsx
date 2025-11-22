import type React from "react"
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-center"   // topo-central
      richColors              // habilita cores por tipo (success, error etc.)
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",

          // 🔹 cores específicas para SUCCESS (quando usa toast.success)
          "--success-bg": "hsl(142 76% 36%)",   // verde forte
          "--success-border": "hsl(142 76% 32%)",
          "--success-text": "white",

          // opcional: deixar erro mais forte também
          "--error-bg": "hsl(0 72% 45%)",
          "--error-border": "hsl(0 72% 40%)",
          "--error-text": "white",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
