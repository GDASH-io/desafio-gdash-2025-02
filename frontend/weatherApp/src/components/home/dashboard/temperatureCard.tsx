import { useEffect, useState } from "react"
import type { IWeatherEntity } from "../../../../../../backend/wather-app-api/src/weather/interfaces/IWeatherEntity"
import sunny from "@/assets/sunny.png"
import partlyCloudy from "@/assets/partly_cloudy.png"
import cloudy from "@/assets/cloudy.png"
import raining from "@/assets/raining.png"
import fewClouds from "@/assets/few_clouds.png"
import { Button } from "@/components/ui/button"
import Insights from "./insights"

export default function TemperatureCard(){

    const [weatherData, setWeatherData] = useState<IWeatherEntity | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [openModal, setOpenModal] = useState(false);

    function temptureFormat(temp: number){
        const decimal = temp - Math.floor(temp);
        if(decimal > 0.5)
            return Math.floor(temp) + 1;
        else
            return Math.floor(temp);
    }

    function convertSunsetTime(sun: number){
        const time = new Date(sun * 1000)
        return time.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function localeData(data: number){
        const date = new Date(data * 1000);
        return date.toLocaleDateString("pt-BR")
    }

    useEffect(() => {
        const fetchWeather = async () => {
            try{
                const response = await fetch("http://localhost:3000/weather/latest");

                if(!response.ok)
                    throw new Error("falha ao conectar a api");

                const data: IWeatherEntity = await response.json();
                console.log(data);
                setWeatherData(data);
            }
            catch(e){
                console.log("vixe deu error", {e})
                if(e instanceof Error)
                    setError(e.message);
                else
                    setError("Erro desconhecido!");
            }
            finally{
                setLoading(false);
            }
        }

        fetchWeather();
    }, [])

    if(loading){
        return(
            <p>Carregando...</p>
        );
    }
    
    if(error){
        return(
            <p>Erro: {error}</p>
        );
    }

    if(weatherData){
        const { cityName, tempture, rain, humidity, sun, cloud } = weatherData;
        
        const temp = temptureFormat(tempture);
        const sunset = convertSunsetTime(sun);
        const date = localeData(sun);

        function getWeather(cloud: number, rain: number){
            if(rain >= 40)
                return {img: raining, desc: "chovendo"};
            if(cloud > 70)
                return {img: cloudy, desc: "nublado"};
            if(cloud > 40)
                return {img: partlyCloudy, desc: "parcialmente nublado"};
            if(cloud > 20)
                return {img: fewClouds, desc: "com poucas nuvens"};
            return {img: sunny, desc: "ensolarado"};
        }

        const {img: weatherImage, desc: weatherDescription} = getWeather(cloud, rain);

        return(
            <>
                {openModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl flex flex-col items-center">
                            <Insights onClose={() => setOpenModal(false)}/>
                        </div>
                    </div>
                )}
                <div className="flex flex-col justify-between p-5 border-2 rounded-lg bg-white text-[#757775]">
                <img src={weatherImage} alt="Sun" className="h-50 w-80"/>
                <h2>Clima do dia {date} em {cityName}</h2>
                <p>Está {weatherDescription} em {cityName} nesse momento</p>
                <p>Temperatura: {temp}°C</p>
                <p>Probabilidade de chuva: {rain}%</p>
                <p>Humidade: {humidity}%</p>
                <p>Pôr do sol: {sunset}</p>
                <Button variant={"secondary"} className="mt-2 ml-23 text-white w-50" onClick={() => setOpenModal(true)}>Insights gerados por IA</Button>
            </div>
            </>
        );
    }
}