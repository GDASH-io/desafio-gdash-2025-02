import type React from "react"
import { Link } from "react-router-dom"

type RouterLinkProps = {
  children: React.ReactNode,
  url: string
} & React.ComponentProps<"a">
export function RouterLink({children, url, ...props}: RouterLinkProps) {
  return <Link to={url} {...props}>{children}</Link>
}