import Navbar from "@/components/home/navbar";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login(){
    const nav = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        if(localStorage.getItem("token"))
            nav('/')
    }, [])

    async function handleLogin(e: React.FormEvent){
        e.preventDefault()

        try{
            const response = await fetch("http://localhost:3000/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if(response.ok){
                localStorage.setItem("token", data.token);
                nav('/');
            }else
                throw new Error("email ou senha incorretos");
        }catch(e){
            if(e instanceof Error)
                console.log("deu esse erro ai: ", e);
            else
                console.log("deu um erro tao louco que ninguem sabe!");
        }
    }

    return(
        <div className="bg-linear-to-t from-[#5aeebd] h-screen w-screen justify-between flex flex-col items-center tracking-wide">
            <Navbar/>
            <div className="flex  flex-col items-center justify-center bg-white border rounded-2xl w-200 h-150 tracking-wide">
                <input
                    className="w-100 max-h-10 bg-[#F2F2F2] outline-none rounded-4xl pl-1 flex text-center mb-2 tracking-wide"
                    type="text"
                    placeholder="email"
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    className="w-100 max-h-10 bg-[#F2F2F2] outline-none rounded-4xl pl-1 flex text-center mb-2 tracking-wide"
                    type="password"
                    placeholder="Senha"
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                        if(e.key === "Entrar") {
                            handleLogin(e);
                        }
                    }}
                />
                <Button variant="secondary" className="text-white hover:bg-blue-700 tracking-wide" onClick={handleLogin}>Entrar</Button>
            </div>
            <div/>
        </div>
    );
}