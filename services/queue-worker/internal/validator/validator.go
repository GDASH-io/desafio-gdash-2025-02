package validator

import (
	"errors"
	"queue-worker/internal/models"
)

func ValidateWeatherData(data *models.WeatherData) error {
	if data.Timestamp == "" {
		return errors.New("timestamp é obrigatório")
	}

	if data.Location.City == "" {
		return errors.New("city é obrigatório")
	}

	if data.Location.Latitude < -90 || data.Location.Latitude > 90 {
		return errors.New("latitude inválida (deve estar entre -90 e 90)")
	}

	if data.Location.Longitude < -180 || data.Location.Longitude > 180 {
		return errors.New("longitude inválida (deve estar entre -180 e 180)")
	}

	if data.Current.Humidity < 0 || data.Current.Humidity > 100 {
		return errors.New("humidity inválida (deve estar entre 0 e 100)")
	}

	if data.Current.Condition == "" {
		return errors.New("condition é obrigatório")
	}

	return nil
}
