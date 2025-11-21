package repositories

// APIClientRepository interface para comunicação com API NestJS
type APIClientRepository interface {
	// SendWeatherLogs envia logs de clima para a API
	SendWeatherLogs(logs []interface{}) error
	
	// IsHealthy verifica se a API está saudável
	IsHealthy() bool
}

