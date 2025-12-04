import TempDiagram from "./dashboard/tempDiagram";
import TemperatureCard from "./dashboard/temperatureCard";
import Navbar from "./navbar";
import { Button } from "../ui/button";
import { useExportForXML } from "./export";

export default function Home(){
    const {handleXML, handleCSV, isLoggedIn} = useExportForXML();

    return (
        <div className="bg-linear-to-t from-[#5aeebd] h-screen w-screen justify-between flex flex-col items-center">
            <Navbar/>
            <TemperatureCard/>
            <TempDiagram/>
            
            <div/>
            {!isLoggedIn ? (
                <p className="text-[10px] font-bold mb-2">Você precisa estar logado para exportar as informações</p>
            ) : (
                <>
                    <Button variant={"secondary"} className="text-white font-bold mb-2" onClick={handleXML}>Exportar as informações para excel(XLSX)</Button>
                    <Button variant={"secondary"} className="text-white font-bold mb-2" onClick={handleCSV}>Exportar as informações para CSV</Button>
                </>
            )}
        </div>
    );
}