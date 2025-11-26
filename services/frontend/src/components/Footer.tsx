export const Footer = () => {
  return (
    <footer className="border-t-2 mt-auto">
      <div className="container flex flex-col items-center justify-between gap-4 py-6 md:h-16 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with React, Vite, TailwindCSS & shadcn/ui
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Weather Dashboard
        </p>
      </div>
    </footer>
  )
}
