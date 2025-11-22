import { Explorer } from '@/pages/Explorer'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/explorer')({
  beforeLoad: ({ location }) => {
    const token = localStorage.getItem('gdash_token')
    if (!token) throw redirect({ to: '/auth/login', search: { redirect: location.href } })
  },
  component: Explorer,
})
