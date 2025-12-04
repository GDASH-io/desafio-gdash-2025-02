import Navbar from "@/components/home/navbar";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserPage(){

    const nav = useNavigate();

    const token = localStorage.getItem("token")

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [openPasswordModal, setOpenPasswordModal] = useState(false);

    

    async function getObj(){
        try{
            const response = await fetch("http://localhost:3000/users/profile", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const resText = await response.text();

            const data = JSON.parse(resText);
            
            if(response.ok){
                setName(data.name);
                setEmail(data.email);
            }else
                throw new Error("Usuário nao encontrado")
        }catch(e){
            if(e instanceof Error)
                console.log("Deu esse erro aqui ó: ", e)
            else
                console.log("O trem foi tao feio que ninguem sabe o que aconteceu")
        }
    }
    
    async function handleEdit(e: React.FormEvent){
        e.preventDefault();

        try{
            const response = await fetch("http://localhost:3000/users/profile/edit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name,
                    email,
                    password
                }),
            });
            
            if(response.ok){
                console.log("O Usuário foi criado quase com sucesso!");
                setName("");
                setEmail("");
            }else
                throw new Error("O token ta doido")
                
        }catch(e){
            if(e instanceof Error)
                console.log("Olha esse errinho bobo: ", e)
            else
                console.log("O trem foi tao feio que ninguem sabe o que aconteceu")
        }
        if(token)
            getObj();
        else
            nav('/');
        
    }

    async function handleEditPassword(e: React.FormEvent){
        e.preventDefault();
        try{
            const response = await fetch("http://localhost:3000/users/profile/edit/password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    password,
                    newPassword,
                }),
            });
            
            if(response.ok){
                console.log("A senha foi alterada!");
                setPassword("");
                setNewPassword("");
            }else
                throw new Error("O token ta doido")
        }catch(e){
            if(e instanceof Error)
                console.log("Deu esse erro aqui ó: ", e)
            else
                console.log("O trem foi tao feio que ninguem sabe o que aconteceu")
        }
    }

    useEffect(() => {
        if(token)
            getObj();
        else
            nav('/');
    }, [])

    return(
        <>
            {openPasswordModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl flex flex-col gap-3 w-80">
                        <h2 className="text-xl font-bold text-center">Alterar senha</h2>

                        <input
                            className="w-full h-10 bg-[#F2F2F2] outline-none rounded-xl px-2"
                            placeholder="Senha atual"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <input
                            className="w-full h-10 bg-[#F2F2F2] outline-none rounded-xl px-2"
                            placeholder="Nova senha"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />

                        <div className="flex gap-2 mt-3">
                            <Button
                                className="flex-1"
                                onClick={() => setOpenPasswordModal(false)}
                            >
                                Cancelar
                            </Button>

                            <Button
                                className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                                onClick={handleEditPassword}
                            >
                                Salvar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-linear-to-t from-[#5aeebd] h-screen w-screen justify-between flex flex-col items-center">
                <Navbar/>
                <div className="flex  flex-col items-center justify-center bg-white border rounded-2xl w-200 h-150">
                    <input
                        className="w-100 max-h-10 bg-[#F2F2F2] outline-none rounded-4xl pl-1 flex text-center mb-2" 
                        placeholder="Nome Completo" 
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input 
                        className="w-100 max-h-10 bg-[#F2F2F2] outline-none rounded-4xl pl-1 flex text-center mb-2" 
                        placeholder="E-mail" 
                        type="email"  
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}              
                    />
                    <input 
                        className="w-100 max-h-10 bg-[#F2F2F2] outline-none rounded-4xl pl-1 flex text-center mb-2"    
                        placeholder="Coloque sua senha" 
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button variant="secondary" className="text-white hover:bg-blue-700 mb-2" onClick={handleEdit}>Editar Informações</Button>
                    <Button variant="secondary" className="text-white hover:bg-blue-700" onClick={() => setOpenPasswordModal(true)}>Editar senha</Button>
                </div>
                <div/>
            </div>
        </>
    );
}