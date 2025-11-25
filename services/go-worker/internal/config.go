package internal

import (
	"io/ioutil"
	"gopkg.in/yaml.v2"
)

type Config struct {
    RabbitMQ struct {
        URL      string `yaml:"URL"`
        EXCHANGE string `yaml:"EXCHANGE"`
    } `yaml:"rabbitmq"`
	Api struct {
		LOGS_URL string `yaml:"LOGS_URL"`
	} `yaml:"api"`
}

func LoadConfig(path string) (*Config, error) {
	data, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var config Config
	err = yaml.Unmarshal(data, &config)
	if err != nil {
		return nil, err
	}
	return &config, nil
}

