package main

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
)

type WeatherData struct {
	Latitude             float64      `json:"latitude"`
	Longitude            float64      `json:"longitude"`
	GenerationtimeMs     float64      `json:"generationtime_ms"`
	UtcOffsetSeconds     int          `json:"utc_offset_seconds"`
	Timezone             string       `json:"timezone"`
	TimezoneAbbreviation string       `json:"timezone_abbreviation"`
	Elevation            float64      `json:"elevation"`
	CurrentUnits         CurrentUnits `json:"current_units"`
	Current              Current      `json:"current"`
	HourlyUnits          HourlyUnits  `json:"hourly_units"`
	Hourly               Hourly       `json:"hourly"`
	DailyUnits           DailyUnits   `json:"daily_units"`
	Daily                Daily        `json:"daily"`
}

type CurrentUnits struct {
	Time                string `json:"time"`
	Interval            string `json:"interval"`
	Temperature2m       string `json:"temperature_2m"`
	RelativeHumidity2m  string `json:"relative_humidity_2m"`
	ApparentTemperature string `json:"apparent_temperature"`
	IsDay               string `json:"is_day"`
	WindSpeed10m        string `json:"wind_speed_10m"`
	WindDirection10m    string `json:"wind_direction_10m"`
	WindGusts10m        string `json:"wind_gusts_10m"`
	Precipitation       string `json:"precipitation"`
	WeatherCode         string `json:"weather_code"`
	CloudCover          string `json:"cloud_cover"`
}

type Current struct {
	Time                string  `json:"time"`
	Interval            int     `json:"interval"`
	Temperature2m       float64 `json:"temperature_2m"`
	RelativeHumidity2m  int     `json:"relative_humidity_2m"`
	ApparentTemperature float64 `json:"apparent_temperature"`
	IsDay               int     `json:"is_day"`
	WindSpeed10m        float64 `json:"wind_speed_10m"`
	WindDirection10m    int     `json:"wind_direction_10m"`
	WindGusts10m        float64 `json:"wind_gusts_10m"`
	Precipitation       float64 `json:"precipitation"`
	WeatherCode         int     `json:"weather_code"`
	CloudCover          int     `json:"cloud_cover"`
}

type HourlyUnits struct {
	Time                     string `json:"time"`
	Temperature2m            string `json:"temperature_2m"`
	PrecipitationProbability string `json:"precipitation_probability"`
	ApparentTemperature      string `json:"apparent_temperature"`
	Precipitation            string `json:"precipitation"`
	WeatherCode              string `json:"weather_code"`
	CloudCover               string `json:"cloud_cover"`
	WindSpeed10m             string `json:"wind_speed_10m"`
	WindGusts10m             string `json:"wind_gusts_10m"`
	RelativeHumidity2m       string `json:"relative_humidity_2m"`
	Visibility               string `json:"visibility"`
}

type Hourly struct {
	Time                     []string  `json:"time"`
	Temperature2m            []float64 `json:"temperature_2m"`
	PrecipitationProbability []int     `json:"precipitation_probability"`
	ApparentTemperature      []float64 `json:"apparent_temperature"`
	Precipitation            []float64 `json:"precipitation"`
	WeatherCode              []int     `json:"weather_code"`
	CloudCover               []int     `json:"cloud_cover"`
	WindSpeed10m             []float64 `json:"wind_speed_10m"`
	WindGusts10m             []float64 `json:"wind_gusts_10m"`
	RelativeHumidity2m       []int     `json:"relative_humidity_2m"`
	Visibility               []float64 `json:"visibility"`
}

type DailyUnits struct {
	Time                        string `json:"time"`
	WeatherCode                 string `json:"weather_code"`
	Temperature2mMax            string `json:"temperature_2m_max"`
	Temperature2mMin            string `json:"temperature_2m_min"`
	ApparentTemperatureMax      string `json:"apparent_temperature_max"`
	ApparentTemperatureMin      string `json:"apparent_temperature_min"`
	PrecipitationSum            string `json:"precipitation_sum"`
	PrecipitationProbabilityMax string `json:"precipitation_probability_max"`
	PrecipitationHours          string `json:"precipitation_hours"`
	UvIndexMax                  string `json:"uv_index_max"`
	SunshineDuration            string `json:"sunshine_duration"`
	Sunrise                     string `json:"sunrise"`
	Sunset                      string `json:"sunset"`
	WindGusts10mMax             string `json:"wind_gusts_10m_max"`
	RelativeHumidity2mMax       string `json:"relative_humidity_2m_max"`
	Temperature2mMean           string `json:"temperature_2m_mean"`
	CapeMax                     string `json:"cape_max"`
}

type Daily struct {
	Time                        []string  `json:"time"`
	WeatherCode                 []int     `json:"weather_code"`
	Temperature2mMax            []float64 `json:"temperature_2m_max"`
	Temperature2mMin            []float64 `json:"temperature_2m_min"`
	ApparentTemperatureMax      []float64 `json:"apparent_temperature_max"`
	ApparentTemperatureMin      []float64 `json:"apparent_temperature_min"`
	PrecipitationSum            []float64 `json:"precipitation_sum"`
	PrecipitationProbabilityMax []int     `json:"precipitation_probability_max"`
	PrecipitationHours          []float64 `json:"precipitation_hours"`
	UvIndexMax                  []float64 `json:"uv_index_max"`
	SunshineDuration            []float64 `json:"sunshine_duration"`
	Sunrise                     []string  `json:"sunrise"`
	Sunset                      []string  `json:"sunset"`
	WindGusts10mMax             []float64 `json:"wind_gusts_10m_max"`
	RelativeHumidity2mMax       []int     `json:"relative_humidity_2m_max"`
	Temperature2mMean           []float64 `json:"temperature_2m_mean"`
	CapeMax                     []float64 `json:"cape_max"`
	CloudCoverMean              []int     `json:"cloud_cover_mean"`
}

type PayloadCurrent struct {
	Time                string  `json:"time"`
	Temperature2m       float64 `json:"temperature2m"`
	RelativeHumidity2m  int     `json:"relativeHumidity2m"`
	ApparentTemperature float64 `json:"apparentTemperature"`
	IsDay               bool    `json:"isDay"`
	Precipitation       float64 `json:"precipitation"`
	WeatherCode         int     `json:"weatherCode"`
	CloudCover          int     `json:"cloudCover"`
	WindSpeed10m        float64 `json:"windSpeed10m"`
	WindDirection10m    int     `json:"windDirection10m"`
	WindGusts10m        float64 `json:"windGusts10m"`
}

type PayloadHourly struct {
	Time                     string  `json:"time"`
	Temperature2m            float64 `json:"temperature2m"`
	RelativeHumidity2m       int     `json:"relativeHumidity2m"`
	ApparentTemperature      float64 `json:"apparentTemperature"`
	PrecipitationProbability int     `json:"precipitationProbability"`
	Precipitation            float64 `json:"precipitation"`
	WeatherCode              int     `json:"weatherCode"`
	CloudCover               int     `json:"cloudCover"`
	WindSpeed10m             float64 `json:"windSpeed10m"`
	WindGusts10m             float64 `json:"windGusts10m"`
	Visibility               float64 `json:"visibility"`
}

type PayloadDaily struct {
	Time                        string  `json:"time"`
	WeatherCode                 int     `json:"weatherCode"`
	Temperature2mMax            float64 `json:"temperature2mMax"`
	Temperature2mMin            float64 `json:"temperature2mMin"`
	Temperature2mMean           float64 `json:"temperature2mMean"`
	ApparentTemperatureMax      float64 `json:"apparentTemperatureMax"`
	ApparentTemperatureMin      float64 `json:"apparentTemperatureMin"`
	Sunrise                     string  `json:"sunrise"`
	Sunset                      string  `json:"sunset"`
	UvIndexMax                  float64 `json:"uvIndexMax"`
	PrecipitationSum            float64 `json:"precipitationSum"`
	PrecipitationHours          float64 `json:"precipitationHours"`
	PrecipitationProbabilityMax int     `json:"precipitationProbabilityMax"`
	WindGusts10mMax             float64 `json:"windGusts10mMax"`
	SunshineDuration            float64 `json:"sunshineDuration"`
	RelativeHumidity2mMax       int     `json:"relativeHumidity2mMax"`
	CloudCoverMean              int     `json:"cloudCoverMean"`
	CapeMax                     float64 `json:"capeMax"`
}

func HandleMessage(message []byte) {
	log.Println("Dados recebidos, processando...")
	var data WeatherData
	err := json.Unmarshal(message, &data)
	if MsgOnErr(err, "erro ao fazer Unmarshal do JSON recebido") {
		return
	}

	go processCurrent(data.Current)
	go processHourly(data.Hourly)
	go processDaily(data.Daily)
}

func processCurrent(c Current) {
	payload := PayloadCurrent{
		Time:                c.Time,
		Temperature2m:       c.Temperature2m,
		RelativeHumidity2m:  c.RelativeHumidity2m,
		ApparentTemperature: c.ApparentTemperature,
		IsDay:               c.IsDay == 1,
		Precipitation:       c.Precipitation,
		WeatherCode:         c.WeatherCode,
		CloudCover:          c.CloudCover,
		WindSpeed10m:        c.WindSpeed10m,
		WindDirection10m:    c.WindDirection10m,
		WindGusts10m:        c.WindGusts10m,
	}
	sendRequest(BaseURL+"/current", payload)
}

func processHourly(h Hourly) {
	var payloadList []PayloadHourly

	for i := range h.Time {
		item := PayloadHourly{
			Time:                     h.Time[i],
			Temperature2m:            h.Temperature2m[i],
			RelativeHumidity2m:       h.RelativeHumidity2m[i],
			ApparentTemperature:      h.ApparentTemperature[i],
			PrecipitationProbability: h.PrecipitationProbability[i],
			Precipitation:            h.Precipitation[i],
			WeatherCode:              h.WeatherCode[i],
			CloudCover:               h.CloudCover[i],
			WindSpeed10m:             h.WindSpeed10m[i],
			WindGusts10m:             h.WindGusts10m[i],
			Visibility:               h.Visibility[i],
		}
		payloadList = append(payloadList, item)
	}

	sendRequest(BaseURL+"/hourly", payloadList)
}

func processDaily(d Daily) {
	var payloadList []PayloadDaily

	for i := range d.Time {
		item := PayloadDaily{
			Time:                        d.Time[i],
			WeatherCode:                 d.WeatherCode[i],
			Temperature2mMax:            d.Temperature2mMax[i],
			Temperature2mMin:            d.Temperature2mMin[i],
			Temperature2mMean:           d.Temperature2mMean[i],
			ApparentTemperatureMax:      d.ApparentTemperatureMax[i],
			ApparentTemperatureMin:      d.ApparentTemperatureMin[i],
			Sunrise:                     d.Sunrise[i],
			Sunset:                      d.Sunset[i],
			UvIndexMax:                  d.UvIndexMax[i],
			PrecipitationSum:            d.PrecipitationSum[i],
			PrecipitationHours:          d.PrecipitationHours[i],
			PrecipitationProbabilityMax: d.PrecipitationProbabilityMax[i],
			WindGusts10mMax:             d.WindGusts10mMax[i],
			SunshineDuration:            d.SunshineDuration[i],
			RelativeHumidity2mMax:       d.RelativeHumidity2mMax[i],
			CloudCoverMean:              d.CloudCoverMean[i],
			CapeMax:                     d.CapeMax[i],
		}
		payloadList = append(payloadList, item)
	}

	sendRequest(BaseURL+"/daily", payloadList)
}

func sendRequest(url string, data interface{}) {
	jsonData, err := json.Marshal(data)
	if MsgOnErr(err, "Erro ao fazer Marshal dos dados para "+url) {
		return
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if MsgOnErr(err, "Erro ao criar requisição POST para "+url) {
		return
	}
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Authorization", "Bearer "+ApiMasterToken)

	client := http.Client{}
	resp, err := client.Do(req)
	if MsgOnErr(err, "Erro na requisição POST para "+url) {
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		log.Printf("Falha ao enviar para %s. Status: %d", url, resp.StatusCode)
	} else {
		log.Printf("Sucesso ao enviar para %s. Status: %d", url, resp.StatusCode)
	}
}
