import { AverageTemperature } from "../Graphics/AverageTemperature";
import { PrecipitationXUmidity } from "../Graphics/PrecipitationXUmidity";
import { SolarRadiation } from "../Graphics/SolarRadiation";

export function DashBoardGraphics() {

  return (
    <article className="flex flex-col gap-3">
      <h1 className="text-2xl text-center">Gráficos semanais</h1>
      <div className="grid xl:grid-cols-2 gap-3">
        <AverageTemperature />
        <PrecipitationXUmidity />
        <SolarRadiation />
      </div>
    </article>
  )
}