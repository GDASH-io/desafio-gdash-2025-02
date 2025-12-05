import { useLocation, useNavigate } from "react-router-dom";
import { TypographyH1, TypographyH3 } from "../ui/tipography";
import { RouterLink } from "../RouterLink";

export function NotFound() {
  const navigate = useNavigate()
  const url = useLocation()
  return (
    <section className="flex flex-col items-center relative h-dvh justify-center">
      <TypographyH1>404</TypographyH1>
      <TypographyH3>Rota {url.pathname} não encontrada</TypographyH3>
      <h4 className="text-[#929292] text-2xl underline" onClick={() => navigate(-1)}>Voltar</h4>
      <h4 className="text-[#929292] text-2xl underline"><RouterLink url="/">Login</RouterLink></h4>
    </section>
  )
}