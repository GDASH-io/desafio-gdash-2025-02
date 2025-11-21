import { createFileRoute } from '@tanstack/react-router'

import { AppLayout } from '@/components/shared/app-layout'

export const Route = createFileRoute('/_app')({
  component: AppLayout,
})
