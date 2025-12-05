type TypographyProps = {
  children: React.ReactNode
}

export function TypographyH1({children}: TypographyProps) {
  return (
    <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
      {children}
    </h1>
  )
}
export function TypographyH2({children}: TypographyProps) {
  return (
    <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
      {children}
    </h2>
  )
}

export function TypographyH3({children}: TypographyProps) {
  return (
    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
      {children}
    </h3>
  )
}

export function TypographyH4({children}: TypographyProps) {
  return (
    <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
      {children}
    </h4>
  )
}


export function TypographyP({children}: TypographyProps) {
  return (
    {children}
  )
}

export function TypographyMuted({children}:TypographyProps) {
  return (
    <p className="text-muted-foreground text-sm">{children}</p>
  )
}

export function TypographySmall({children}:TypographyProps) {
  return (
    <small className="text-sm leading-none font-medium">{children}</small>
  )
}