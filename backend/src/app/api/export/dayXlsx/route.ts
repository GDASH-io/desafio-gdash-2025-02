import { getDailyWeatherAll } from "@/db/models/dailyWeather";
import { HandleSession } from "@/handlers/session";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const session = await HandleSession(request)
    if(!session || session.user == undefined) {
      return NextResponse.json({message: "Login required"}, {status: 401})
    }

    const data = await getDailyWeatherAll();
    const formattedData = data.map((item) => ({
      time: item.time.toLocaleString("pt-BR"),
      weatherCode: item.weatherCode,
      temperature2mMax: item.temperature2mMax,
      temperature2mMin: item.temperature2mMin,
      temperature2mMean: item.temperature2mMean,
      apparentTemperatureMax: item.apparentTemperatureMax,
      apparentTemperatureMin: item.apparentTemperatureMin,
      sunrise: item.sunrise,
      sunset: item.sunset,
      uvIndexMax: item.uvIndexMax,
      precipitationSum: item.precipitationSum,
      precipitationHours: item.precipitationHours,
      precipitationProbabilityMax: item.precipitationProbabilityMax,
      windGusts10mMax: item.windGusts10mMax,
      sunshineDuration: item.sunshineDuration,
      relativeHumidity2mMax: item.relativeHumidity2mMax,
      cloudCoverMean: item.cloudCoverMean,
      capeMax: item.capeMax,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dates");

    const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="weather_data.xlsx"',
      },
    });

  } catch (error) {
    return new NextResponse(JSON.stringify({ error: error }), { status: 500 });
  }
}