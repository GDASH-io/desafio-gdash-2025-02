import { getLatestCurrentWeather } from "@/db/models/currentWeatcher";
import { getDailyWeatherByDay, getUpcomingDailyWeather } from "@/db/models/dailyWeather";
import { getUpcomingHourlyWeather } from "@/db/models/hourlyWeather";
import { findInsightsByTime } from "@/db/models/insight";
import { HandleSession } from "@/handlers/session";
import { addDays } from "date-fns";
import { NextResponse, NextRequest } from "next/server";

export interface HourlyForecast {
  time: Date;
  hour: string;
  temperature: number;
  weatherCode: number;
}

export interface DailyForecast {
  time: Date;
  date: string;
  temperature: number;
  apparentTemperature: number;
  maxTemperature: number;
  minTemperature: number;
  weatherCode: number;
  insights: string[];
}

export interface WeatherResponse {
  city: string;
  date: string;
  hour: string;
  temperature: number;
  apparentTemperature: number;
  maxTemperature: number;
  minTemperature: number;
  weatherCode: number;
  insights: string[];
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

export async function GET(request: NextRequest) {
  try {
    const session = await HandleSession(request)
    if (!session || session.user == undefined) {
      return NextResponse.json({message: "login required"}, {status: 401})
    }

    const currentWeather = await getLatestCurrentWeather();
    const dailyWeather = await getDailyWeatherByDay(Date.now());

    if (!currentWeather || !dailyWeather) {
      return NextResponse.json({ error: "Dados meteorológicos não encontrados." }, { status: 500 });
    }

    const now = new Date();
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const parts = formatter.formatToParts(now);
    const weekday = parts.find(p => p.type === 'weekday')?.value;
    const day = parts.find(p => p.type === 'day')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const year = parts.find(p => p.type === 'year')?.value;
    const capitalizedWeekday = weekday ? weekday.charAt(0).toUpperCase() + weekday.slice(1) : '';
    const capitalizedMonth = month ? month.charAt(0).toUpperCase() + month.slice(1) : '';


    const formattedDate = `${capitalizedWeekday}, ${day} de ${capitalizedMonth} ${year}`;
    const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo',
      hour12: false
    });

    const upcomingHourly = await getUpcomingHourlyWeather(Date.now(), 24);
    const nextDay = addDays(Date.now(), 1)
    const upcomingDaily = await getUpcomingDailyWeather(nextDay.getTime(), 7);

    const hourlyForecast: HourlyForecast[] = upcomingHourly.map(item => ({
      time: item.time,
      hour: timeFormatter.format(new Date(item.time)),
      temperature: item.temperature2m,
      weatherCode: item.weatherCode
    }));

    const dailyFormatter = new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const dailyForecastPromise = upcomingDaily.map(async (item) => {
      const dateParts = dailyFormatter.formatToParts(new Date(item.time));
      const weekday = dateParts.find(p => p.type === 'weekday')?.value;
      const day = dateParts.find(p => p.type === 'day')?.value;
      const month = dateParts.find(p => p.type === 'month')?.value;
      const year = dateParts.find(p => p.type === 'year')?.value;

      const capitalizedWeekday = weekday ? weekday.charAt(0).toUpperCase() + weekday.slice(1) : '';
      const capitalizedMonth = month ? month.charAt(0).toUpperCase() + month.slice(1) : '';

      const formattedDate = `${capitalizedWeekday}, ${day} de ${capitalizedMonth} ${year}`;

      let resps = await findInsightsByTime(item.time)
      let insights = resps.map((resp) => {
        return (resp.insight)
      })

      return {
        time: item.time,
        date: formattedDate,
        temperature: item.temperature2mMean,
        apparentTemperature: (item.apparentTemperatureMax + item.apparentTemperatureMin) / 2,
        maxTemperature: item.temperature2mMax,
        minTemperature: item.temperature2mMin,
        weatherCode: item.weatherCode,
        insights: insights
      };
    });

    let resps = await findInsightsByTime(currentWeather.time)
    let insights = resps.map((resp) => {
      return (resp.insight)
    })

    const dailyForecast: DailyForecast[] = await Promise.all(dailyForecastPromise)

    const response = {
      city: "Sete Lagoas",
      date: formattedDate,
      hour: timeFormatter.format(now),
      temperature: currentWeather.temperature2m,
      apparentTemperature: currentWeather.apparentTemperature,
      maxTemperature: dailyWeather.temperature2mMax,
      minTemperature: dailyWeather.temperature2mMin,
      weatherCode: currentWeather.weatherCode,
      insights: insights,
      hourly: hourlyForecast,
      daily: dailyForecast
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Erro ao buscar dados: ${error}` }, { status: 500 });
  }
}