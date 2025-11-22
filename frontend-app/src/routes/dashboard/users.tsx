import { Users } from '@/pages/Users'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/users')({
  beforeLoad: ({ location }) => {
    const token = localStorage.getItem('gdash_token')
    if (!token) throw redirect({ to: '/auth/login', search: { redirect: location.href } })
  },
  component: Users,
})

