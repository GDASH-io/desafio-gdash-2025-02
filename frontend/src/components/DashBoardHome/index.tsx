import { Banner } from "../Banner";
import { IaInsights } from "../IaInsights";
import { WeatherInfo } from "../WeatherInfo";
import { WindSpeed } from "../WindSpeed";
import { MinMaxCarousel } from "../MinMaxCarousel";
import { UvIndex } from "../UvIndex";

export function DashBoardHome() {
  return (
    <article className="grid gap-3 lg:grid-cols-2">
      <WeatherInfo />
      <MinMaxCarousel/>
      <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
        <WindSpeed />
        <UvIndex/>
      </div>
      <IaInsights />
      <Banner />
    </article>
  )
}