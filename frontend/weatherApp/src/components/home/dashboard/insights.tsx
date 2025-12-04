import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown";

export default function Insights({ onClose }: { onClose: () => void }){
    const [aiMessage, setAiMessage] = useState("");
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        
        async function aiInsights(){
            try{
                const response = await fetch("http://localhost:3000/weather/insights")
                if(!response.ok)
                    throw new Error("Essa api ta meio doida");

                const aiText = await response.text();
                setAiMessage(aiText);
            }catch(e){
                if(e instanceof Error)
                    console.log("Deu esse erro aqui ó: ", e);
                else
                    console.log("o trem foi tao feio que ninguem sabe o que aconteceu");
            }finally{
                setLoading(false);
            }

        }

        aiInsights();
        
    }, [])

    if(loading){
        return(
            <div className="p-5 flex items-center justify-center flex-col font-bold">
                <p>Solicitando insight à IA...</p>
                <Button variant={"secondary"} onClick={onClose} className="text-white w-50 m-2">Cancelar</Button>
            </div>
        )
    }

    return(
        <div className="flex items-center justify-center">
            <div className="bg-white shadow-lg rounded-xl p-6 w-[70vw] max-h-[70vh] overflow-y-auto">
                <h1 className="text-3xl font-bold mb-4 text-gray-800 text-center">Insights gerados pela IA</h1>
                <div className="prose prose-lg max-w-none text-left">
                    <ReactMarkdown>{aiMessage}</ReactMarkdown>
                </div>
                <div className="flex justify-center mt-6">
                    <Button variant={"secondary"} onClick={onClose} className="text-white w-50 mb-2">Fechar</Button>
                </div>
            </div>            
        </div>
    )
}