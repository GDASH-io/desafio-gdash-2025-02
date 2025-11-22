import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
 beforeLoad: () => {
  const token = localStorage.getItem('gdash_token')
  if (!token) throw redirect({ to: '/auth/login' })
  throw redirect({ to: '/dashboard' })
 }
})
