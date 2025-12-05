package utils

import "encoding/json"

func GetStruc(value string) (map[string]any, error) {
	var jsonValue map[string]any
	errMarsh := json.Unmarshal([]byte(value), &jsonValue)

	return  jsonValue, errMarsh
}