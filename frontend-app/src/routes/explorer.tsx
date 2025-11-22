import { Explorer } from '@/pages/Explorer'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/explorer')({
  component: Explorer,
})
