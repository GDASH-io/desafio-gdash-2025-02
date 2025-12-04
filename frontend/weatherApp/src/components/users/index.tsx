import React, { useState } from "react";
import Navbar from "../home/navbar";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

export default function Users(){
    const nav = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleSubmit(e: React.FormEvent){
        e.preventDefault();

        try{
            const response = await fetch('http://localhost:3000/users/', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    password
                }),
            });
            if(response.ok){
                setName("");
                setEmail("");
                setPassword("");
            }else
                throw Error("Não foi possivel se conectar com a api!!");
        }catch(e){
            console.log("Deu erro aqui: ", e);
        }
        nav('/login');
    }

    return(
        <div className="bg-linear-to-t from-[#5aeebd] h-screen w-screen justify-between flex flex-col items-center">
            <Navbar/>
            <div className="flex  flex-col items-center justify-center bg-white border rounded-2xl w-200 h-150">
                <input
                    className="w-100 max-h-10 bg-[#F2F2F2] outline-none rounded-4xl pl-1 flex text-center mb-2" 
                    placeholder="Nome Completo" 
                    type="text"
                    onChange={(e) => setName(e.target.value)}
                />
                <input 
                    className="w-100 max-h-10 bg-[#F2F2F2] outline-none rounded-4xl pl-1 flex text-center mb-2" 
                    placeholder="E-mail" 
                    type="email"  
                    onChange={(e) => setEmail(e.target.value)}              
                />
                <input 
                    className="w-100 max-h-10 bg-[#F2F2F2] outline-none rounded-4xl pl-1 flex text-center mb-2"    
                    placeholder="Senha" 
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button variant="secondary" className="text-white hover:bg-blue-700" onClick={handleSubmit}>Confirmar</Button>
            </div>
            <div/>
        </div>
    );
}