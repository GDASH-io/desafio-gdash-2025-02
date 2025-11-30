import { Dashboard } from '@/pages/Dashboard'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/')({
  beforeLoad: ({ location }) => {
    const token = localStorage.getItem('gdash_token')
    if (!token) {
      throw redirect({
        to: '/auth/login',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: Dashboard,
})
