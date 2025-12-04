import { useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function TempDiagram(){
    const [data, setData] = useState<{
        hour: number;
        temp: number;
    }[]>([]);
    const [error, setError] = useState<string | null>("")

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 rounded shadow text-sm">
                    <p><strong>Hora:</strong> {label}h</p>
                    <p><strong>Temperatura:</strong> {Math.round(payload[0].value)}°C</p>
                </div>
            );
        }
        return null;
    };

    useEffect(() => {
        const fetchTemp = async () => {
            try{

                console.log("entrei")
                const res = await fetch('http://localhost:3000/weather/latest/allTemp');

                if(!res.ok)
                    throw Error("falha ao conectar a api")

                const resText = await res.text();

                const response = resText.replace(/(\d+)\s*:/g, '"$1":');

                console.log("o que tem no restText: ", response);
                
                const json = JSON.parse(response);
                
                console.log("tem algo no json? ", json)
                
                const format = Object.keys(json).map(key => ({
                    hour: Number(key),
                    temp: Number(json[key])
                }));

                console.log(format)

                setData(format);
            }catch(e){
                if(e instanceof Error)
                    setError(e.message);
                else
                    setError("erro desconhecido")

                console.log("Vixe deu esse erro aqui ó: ", error);
            }
        }

        fetchTemp();
    }, [])

    return(
        <div className="w-300 h-64 p-4 bg-white rounded-xl shadow tracking-wide">
            <h2 className="text-[#757775]">Temperatura durante o dia</h2>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} className="p-5">
                    <XAxis dataKey="hour" label={{ value: "Hora", position: "insideBottomRight", offset: -5 }}/>
                    <YAxis label={{ value: "°C", angle: 0, position: "insideLeft" }}/>
                    <Tooltip content={<CustomTooltip/>} cursor={false}/>
                    <Line type="monotone" dataKey="temp" stroke="#8884d8" strokeWidth={2} dot={false} activeDot={false}/>
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}