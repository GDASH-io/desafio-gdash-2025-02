import { getAllHourlyWeather } from '@/db/models/hourlyWeather';
import { HandleSession } from '@/handlers/session';
import { NextResponse, NextRequest } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const session = await HandleSession(request)
    if(!session || session.user == undefined) {
      return NextResponse.json({message: "Login required"}, {status: 401})
    }

    const data = await getAllHourlyWeather();

    const formattedData = data.map((item: any) => ({
      time: item.time ? new Date(item.time).toLocaleString("pt-BR") : null,
      temperature2m: item.temperature2m,
      relativeHumidity2m: item.relativeHumidity2m,
      apparentTemperature: item.apparentTemperature,
      precipitationProbability: item.precipitationProbability,
      precipitation: item.precipitation,
      weatherCode: item.weatherCode,
      cloudCover: item.cloudCover,
      windSpeed10m: item.windSpeed10m,
      windGusts10m: item.windGusts10m,
      visibility: item.visibility,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    
    XLSX.utils.book_append_sheet(workbook, worksheet, "Hourly Data");

    const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="hourly_weather_data.xlsx"',
      },
    });

  } catch (error) {
    return new NextResponse(JSON.stringify({ error: error }), { status: 500 });
  }
}