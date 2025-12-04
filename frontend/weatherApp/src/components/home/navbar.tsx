import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../../assets/logo.png"

export default function Navbar(){
    const navi = useNavigate()
    const [logged, setLogged] = useState(false)

    useEffect(() => {
        if(localStorage.getItem("token"))
            setLogged(true);
        else
            setLogged(false);
    })

    function handleLogout(){
        localStorage.removeItem("token");
        window.location.reload();
    }

    return (
        <div className="w-full bg-linear-to-b from-[#10669b] border-transparent">
            <header className="w-full h-16 flex tracking-wide items-center px-4 justify-between text-white">
                <Sheet>
                    <SheetTrigger>
                        <Menu size={28}/>
                    </SheetTrigger>

                    <SheetContent side="left" className="pt-20 bg-linear-to-t from-black to-[#93dce6] flex justify-between shadow">
                        {logged ? (
                            <>
                                <div className="flex flex-col gap-4 p-3">
                                    <Button variant="secondary" className="text-white" onClick={() => navi('/')}>Página inicial</Button>
                                    <Button variant="secondary" className="md:hidden text-white" onClick={handleLogout}>Sair</Button>
                                    <Button variant="secondary" className="md:hidden text-white" onClick={() => navi('/user')}>Minhas Informações</Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex flex-col gap-4 p-3">
                                    <Button variant="secondary" className="text-white" onClick={() => navi('/')}>Página inicial</Button>
                                    <Button variant="secondary" className="md:hidden text-white" onClick={() => navi('/login')}>Login</Button>
                                    <Button variant="secondary" className="md:hidden text-white" onClick={() => navi('/users')}>Cadastrar-se</Button>
                                </div>
                            </>
                        )}
                    </SheetContent>
                </Sheet>
                <img src={logo} alt="Logo" className="h-120 mt-10 object-contain tracking-wide"/>
                <div className="w-7 md:w-0"/>
            </header>
            <nav className="w-full h-10 bg-linear-to-b hidden md:flex items-center gap-6 px-4">
                {logged ? (
                    <>
                        <Button variant="secondary" className="text-white hover:bg-blue-700" onClick={() => navi('/')}>Página inicial</Button>
                        <Button variant="secondary" className="text-white hover:bg-blue-700" onClick={handleLogout}>Sair</Button>
                        <Button variant="secondary" className="text-white hover:bg-blue-700" onClick={() => navi('/user')}>Minhas informações</Button>
                    </>
                ) : (
                    <>
                        <Button variant="secondary" className="text-white hover:bg-blue-700" onClick={() => navi('/')}>Página inicial</Button>
                        <Button variant="secondary" className="text-white hover:bg-blue-700" onClick={() => navi('/login')}>Login</Button>
                        <Button variant="secondary" className="text-white hover:bg-blue-700" onClick={() => navi('/users')}>Cadastrar-se</Button>
                    </>
                )}
            </nav>
        </div>
    );
}