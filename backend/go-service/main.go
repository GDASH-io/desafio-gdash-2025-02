package main

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"net/http/cookiejar"
	"os"
	"strconv"
	"strings"

	"time"
	"worker/models"
	"worker/utils"

	"github.com/redis/go-redis/v9"
)

var ctx = context.Background()
var streamConfig = models.StreamConfig{
	GroupName: "workers",
	Consumer:  "go-worker",
	Streams:   []string{"weather:data", ">"},
	Count:     1,
	Block:     1800,
}
var (
	globalClient *http.Client
	lastLogin    = time.Now()
)

func createRedisClient() *redis.Client {
	REDIS_DB, err := strconv.Atoi(os.Getenv("REDIS_DB"))
	if err != nil {
		log.Fatal("Erro ao conseguir o numero do database do redis!")
	}
	return redis.NewClient(&redis.Options{
		Addr:     os.Getenv("REDIS_HOST") + ":" + os.Getenv("REDIS_PORT"),
		Password: os.Getenv("REDIS_PASSWORD"),
		DB:       REDIS_DB,
		PoolSize: 100,
	})
}

func createGroup(redisClient *redis.Client) {
	err := redisClient.XGroupCreateMkStream(
		ctx,
		streamConfig.Streams[0],
		streamConfig.GroupName,
		"0",
	).Err()
	if err != nil {
		log.Print(err.Error())
	}
}

func processData(id string, rawWeatherData map[string]any) (jobId string, done bool) {
	// validação dos dados
	if rawWeatherData["success"] == false {
		log.Print(rawWeatherData["message"])
		return id, true
	}

	var weatherInfo = rawWeatherData["current"].(map[string]any)
	var needDaily = bool(rawWeatherData["has_daily"].(bool))
	dataToSend := models.Weather{
		CityName: rawWeatherData["city_name"].(string),
		Coordinates: models.Coordinates{
			Latitude:  rawWeatherData["latitude"].(float64),
			Longitude: rawWeatherData["longitude"].(float64),
		},
		CloudCover:          weatherInfo["cloud_cover"].(float64),
		Precipitation:       weatherInfo["precipitation"].(float64),
		Humidity:            weatherInfo["relative_humidity_2m"].(float64),
		Temperature:         weatherInfo["temperature_2m"].(float64),
		WindSpeed:           weatherInfo["wind_speed_10m"].(float64),
		Time:                weatherInfo["time"].(string),
		ApparentTemperature: weatherInfo["apparent_temperature"].(float64),
		Rain:                weatherInfo["rain"].(float64),
		IsDay:               weatherInfo["is_day"].(float64),
	}

	var tempData []string = strings.Split(string(dataToSend.Time), "T")
	date := tempData[0] + "T00:00:00-03:00"
	hour := tempData[1]
	dataToSend.Time = hour
	dataToSend.Date = date

	if needDaily {
		var weatherDaily = rawWeatherData["daily"].(map[string]any)
		dataToSend.DailyInfo = &models.DailyInfo{
			Days:           weatherDaily["time"].([]any),
			TempMin:        weatherDaily["temperature_2m_min"].([]any),
			TempMax:        weatherDaily["temperature_2m_max"].([]any),
			UvIndex:        weatherDaily["uv_index_max"].([]any),
			SolarRadiation: weatherDaily["shortwave_radiation_sum"].([]any),
		}
		days := dataToSend.DailyInfo.Days
		for i, day := range days {
			dataToSend.DailyInfo.Days[i] = day.(string) + "T00:00:00-03:00"
		}
	}


	// envia dados para a API em nestjs
	dataToSendJson, err := json.Marshal(dataToSend)
	if err != nil {
		log.Print("Erro ao converter os dados para enviar para a API...")
		log.Print(err)
		return "", false
	}
	req, errReq := http.NewRequest(http.MethodPost, os.Getenv("API_URL")+"/weather/logs", bytes.NewBuffer(dataToSendJson))

	if errReq != nil {
		log.Print("Erro ao criar requisição POST para a API")
		log.Print(errReq)
		return id, false
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	resp, errResp := globalClient.Do(req)
	if errResp != nil {
		log.Print("Erro ao enviar os dados para a API")
		log.Print(errResp)
		return id, false
	}
	defer resp.Body.Close()

	body, errBody := io.ReadAll(resp.Body)
	if errBody != nil {
		log.Print("Erro ao ler resposta da API")
		log.Print(errBody)
		return id, false
	}

	bodyRes, errBodyRes := utils.GetStruc(string(body))

	if resp.StatusCode != 201 {
		log.Print("Código:", resp.StatusCode)
		log.Print(bodyRes["message"])
		return id, false
	}

	if errBodyRes != nil {
		log.Print("Dados enviados mas houve um erro ao pegar body da resposta")
		return id, true
	}

	log.Printf("Status: %d\n", resp.StatusCode)
	log.Print(bodyRes["message"])

	return id, true
}

func theresPending(redisClient *redis.Client) {
	tries := 5
	var pendingIDs []string

	for tries > 0 {
		pendingStreams, errPending := redisClient.XPendingExt(ctx, &redis.XPendingExtArgs{
			Stream: streamConfig.Streams[0],
			Group:  streamConfig.GroupName,
			Start:  "-",
			End:    "+",
			Count:  10,
		}).Result()

		if errPending != nil {
			log.Print("Erro ao pegar lista dos trabalhos pendendentes")
			log.Print(errPending)
			log.Print("Tentando novamente...")
			tries--
			continue
		}

		if len(pendingStreams) == 0 {
			log.Print("Sem mensagens em processamento pendendetes")
			return
		}

		// pega os ids das mensagens em processamento pendente
		for _, p := range pendingStreams {
			pendingIDs = append(pendingIDs, p.ID)
		}
		break
	}

	if tries == 0 {
		log.Print("Erro ao consultar lista de mensagens em processamento pendente")
		log.Print("Cancelando...")
		return
	}

	streams, errClaiming := redisClient.XClaim(ctx, &redis.XClaimArgs{
		Stream:   streamConfig.Streams[0],
		Group:    streamConfig.GroupName,
		Consumer: streamConfig.Consumer,
		MinIdle:  5 * time.Second,
		Messages: pendingIDs,
	}).Result()

	if errClaiming != nil {
		log.Print("Erro ao puxar mensagens com processamento pendente")
		log.Print(errClaiming)
		log.Print("Cancelando...")
		return
	}

	for _, stream := range streams {
		var rawWeatherData map[string]any

		// pega os dados da mensagem
		for _, msg := range stream.Values {
			if strData, ok := msg.(string); ok {
				err := json.Unmarshal([]byte(strData), &rawWeatherData)
				if err != nil {
					log.Printf("Erro no unmarshal: %v", err)
					continue
				}
			} else {
				log.Printf("Valor inesperado no stream: %#v", msg)
			}
		}

		processData(stream.ID, rawWeatherData)

		messageID, done := processData(stream.ID, rawWeatherData)

		if !done {
			log.Printf("Erro ao processar mensagem %s", messageID)
			continue
		} else if done {
			// tenta dar acknowledgment na mensagem já processada
			ackTries := 3
			for ackTries > 0 {
				err := redisClient.XAck(ctx, streamConfig.Streams[0], streamConfig.GroupName, messageID).Err()
				if err != nil {
					log.Printf("Erro ao dar ACK na mensagem %s", messageID)
					log.Printf("Tentando novamente....")
					ackTries--
					continue
				}
				break
			}
		}
	}

}

func lookForNewMessages(redisClient *redis.Client) {
	var rawWeatherData map[string]any
	var id string
	streams, errStreams := redisClient.XReadGroup(ctx, &redis.XReadGroupArgs{
		Streams:  streamConfig.Streams,
		Group:    streamConfig.GroupName,
		Consumer: streamConfig.Consumer,
		Block:    time.Minute * time.Duration(streamConfig.Block),
		Count:    1,
	}).Result()

	// se tiver erros ou não existir mensagens novas
	if errStreams != nil {
		if errStreams == redis.Nil {
			log.Print("Não há novas mensagens")
			return
		}
		log.Print("Erro ao procurar por novas mensagens")
		log.Print(errStreams)
		return
	}

	for _, stream := range streams {
		for _, msg := range stream.Messages {
			for _, value := range msg.Values {
				if strData, ok := value.(string); ok {
					err := json.Unmarshal([]byte(strData), &rawWeatherData)
					if err != nil {
						log.Printf("Erro no unmarshal: %v", err)
						return
					}
				} else {
					log.Printf("Valor inesperado no stream: %#v", msg)
					return
				}
				id = msg.ID
			}
		}
	}

	messageID, done := processData(id, rawWeatherData)

	if !done {
		log.Printf("Erro ao processar mensagem %s", messageID)
		return
	} else if done {
		// tenta dar acknowledgment na mensagem já processada
		ackTries := 3
		for ackTries > 0 {
			err := redisClient.XAck(ctx, streamConfig.Streams[0], streamConfig.GroupName, messageID).Err()
			if err != nil {
				log.Printf("Erro ao dar ACK na mensagem %s", messageID)
				log.Printf("Tentando novamente....")
				time.Sleep(30 * time.Second)
				ackTries--
				continue
			}
			break
		}
	}

}

func loginOnApi(loginInfo *models.LoginInfo) {
	jsonData, errJson := json.Marshal(loginInfo)
	if errJson != nil {
		log.Print("Erro ao carregar credênciais para a API")
		log.Fatal("Encerrando...")
	}

	req, errMakingReq := http.NewRequest(http.MethodPost, os.Getenv("API_URL")+"/user/login", bytes.NewBuffer(jsonData))
	if errMakingReq != nil {
		log.Print("Erro ao criar requisição")
		log.Panic(errMakingReq)
	}

	req.Header.Set("Content-Type", "application/json")

	res, errRes := globalClient.Do(req)
	if errRes != nil {
		log.Print("Erro ao enviar requisição")
		log.Print(errRes)
		log.Fatal("Encerrando...")
	}
	defer res.Body.Close()

	body, errBody := io.ReadAll(res.Body)
	if errBody != nil {
		log.Print("Erro ao conseguir dados do body")
	}

	bodyParsed, errBodyParsing := utils.GetStruc(string(body))

	if errBodyParsing != nil {
		log.Print("Erro ao ler body de resposta")
		return
	}

	if res.StatusCode != http.StatusOK {
		log.Print(res.Status)
		log.Print("Erro ao fazer login")
		log.Fatal(bodyParsed["message"])
		return
	}

	log.Print(res.Status)
	log.Print("Sucesso ao logar na api")
	lastLogin = time.Now()
}

func signupOnApi(signupInfo *models.SignupInfo) {
	jsonData, errJson := json.Marshal(signupInfo)
	if errJson != nil {
		log.Print("Erro ao carregar credênciais para a API")
		log.Fatal("Encerrando...")
	}

	req, errMakingReq := http.NewRequest(
		http.MethodPost,
		os.Getenv("API_URL")+"/user/signup",
		bytes.NewReader(jsonData),
	)

	if errMakingReq != nil {
		log.Print("Erro ao criar requisição")
		log.Panic(errMakingReq)
	}
	req.Header.Set("Content-Type", "application/json")

	res, errRes := globalClient.Do(req)
	if errRes != nil {
		log.Print("Erro ao enviar requisição")
		log.Print(errRes)
		log.Fatal("Encerrando...")
	}
	defer res.Body.Close()

	body, errBody := io.ReadAll(res.Body)
	if errBody != nil {
		log.Print("Erro ao conseguir dados do body")
	}

	bodyParsed, errBodyParsing := utils.GetStruc(string(body))

	if errBodyParsing != nil {
		log.Print("Erro ao ler body de resposta")
		return
	}

	if res.StatusCode == 500 {
		log.Print("Erro interno do servidor")
		log.Fatal(bodyParsed)
		return
	}

	log.Print(res.Status)
	log.Print(bodyParsed["message"])
}

func redisConnectionTest(redisClient *redis.Client) {
	result, err := redisClient.Ping(ctx).Result()
	if err != nil {
		log.Fatal("Erro ao conectar com Redis:", err)
	}
	log.Print("Redis: ", result)
}

func main() {

	signupInfo := &models.SignupInfo{
		Name:     os.Getenv("SERVICE_NAME"),
		Email:    os.Getenv("SERVICE_EMAIL"),
		Password: os.Getenv("SERVICE_API_PASSWORD"),
	}

	loginInfo := &models.LoginInfo{
		Email:    os.Getenv("SERVICE_EMAIL"),
		Password: os.Getenv("SERVICE_API_PASSWORD"),
	}

	redisClient := createRedisClient()
	jar, _ := cookiejar.New(nil)
	globalClient = &http.Client{
		Timeout: 30 * time.Second,
		Jar:     jar,
	}
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	redisConnectionTest(redisClient)
	createGroup(redisClient)
	signupOnApi(signupInfo)
	loginOnApi(loginInfo)

	for {
		if time.Since(lastLogin) >= 5*time.Hour+30*time.Minute {
			loginOnApi(loginInfo)
		}
		theresPending(redisClient)
		lookForNewMessages(redisClient)
		time.Sleep(1 * time.Minute)
	}
}
