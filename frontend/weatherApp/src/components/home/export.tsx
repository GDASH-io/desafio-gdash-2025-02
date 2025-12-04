export function useExportForXML(){
    async function handleXML(){
        try{
            const response = await fetch("http://localhost:3000/weather/latest/export/xls/", {
                method: "GET",
            })
            
            if(!response.ok)
                throw new Error("Essa api deve estar desligada");

            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = "weather.xlsx";
            link.click();

            window.URL.revokeObjectURL(url);
        }catch(e){
            if(e instanceof Error)
                console.log("Olha o erro que deu: ", e)
            else
                console.log("rapaz... ta certo isso?")
        }
    }

    async function handleCSV(){
        try{
            const response = await fetch("http://localhost:3000/weather/latest/export/csv/", {
                method: "GET",
            })
            
            if(!response.ok)
                throw new Error("Essa api deve estar desligada");

            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = "weather.csv";
            link.click();

            window.URL.revokeObjectURL(url);
        }catch(e){
            if(e instanceof Error)
                console.log("Olha o erro que deu: ", e)
            else
                console.log("rapaz... ta certo isso?")
        }
    }

    const isLoggedIn = !!localStorage.getItem("token");

    return {handleXML, handleCSV, isLoggedIn};
}