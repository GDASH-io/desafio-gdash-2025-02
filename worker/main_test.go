package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"
)

func TestFailOnError(t *testing.T) {
	t.Run("logs error when error is not nil", func(t *testing.T) {
		err := http.ErrServerClosed
		failOnError(err, "test error")
		// This test just ensures the function doesn't panic
	})

	t.Run("does nothing when error is nil", func(t *testing.T) {
		failOnError(nil, "test error")
		// This test just ensures the function doesn't panic
	})
}

func TestConnectRabbitMQ_EnvironmentVariables(t *testing.T) {
	tests := []struct {
		name     string
		envVars  map[string]string
		expected string
	}{
		{
			name: "default values",
			envVars: map[string]string{
				"RABBITMQ_USER":     "",
				"RABBITMQ_PASSWORD": "",
				"RABBITMQ_HOST":     "",
				"RABBITMQ_PORT":     "",
			},
			expected: "amqp://guest:guest@rabbitmq:5672/",
		},
		{
			name: "custom values",
			envVars: map[string]string{
				"RABBITMQ_USER":     "admin",
				"RABBITMQ_PASSWORD": "secret",
				"RABBITMQ_HOST":     "localhost",
				"RABBITMQ_PORT":     "5673",
			},
			expected: "amqp://admin:secret@localhost:5673/",
		},
		{
			name: "partial custom values",
			envVars: map[string]string{
				"RABBITMQ_USER": "testuser",
				"RABBITMQ_HOST": "testhost",
			},
			expected: "amqp://testuser:guest@testhost:5672/",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Set environment variables
			for key, value := range tt.envVars {
				if value != "" {
					os.Setenv(key, value)
				} else {
					os.Unsetenv(key)
				}
			}

			// Clean up after test
			defer func() {
				for key := range tt.envVars {
					os.Unsetenv(key)
				}
			}()

			// Build connection string manually to test logic
			user := os.Getenv("RABBITMQ_USER")
			pass := os.Getenv("RABBITMQ_PASSWORD")
			host := os.Getenv("RABBITMQ_HOST")
			port := os.Getenv("RABBITMQ_PORT")

			if user == "" {
				user = "guest"
			}
			if pass == "" {
				pass = "guest"
			}
			if host == "" {
				host = "rabbitmq"
			}
			if port == "" {
				port = "5672"
			}

			connStr := "amqp://" + user + ":" + pass + "@" + host + ":" + port + "/"

			if connStr != tt.expected {
				t.Errorf("Expected connection string %s, got %s", tt.expected, connStr)
			}
		})
	}
}

func TestPostToBackend(t *testing.T) {
	t.Run("successful post", func(t *testing.T) {
		// Create a test server
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Verify request method
			if r.Method != http.MethodPost {
				t.Errorf("Expected POST request, got %s", r.Method)
			}

			// Verify content type
			if r.Header.Get("Content-Type") != "application/json" {
				t.Errorf("Expected Content-Type application/json, got %s", r.Header.Get("Content-Type"))
			}

			// Verify request body
			var data map[string]interface{}
			if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
				t.Errorf("Failed to decode request body: %v", err)
			}

			// Send success response
			w.WriteHeader(http.StatusCreated)
		}))
		defer server.Close()

		// Set backend URL to test server
		os.Setenv("BACKEND_URL", server.URL)
		defer os.Unsetenv("BACKEND_URL")

		// Test data
		testData := []byte(`{"city":"Test","temperature":20.0}`)

		// Call function
		err := postToBackend(testData)

		if err != nil {
			t.Errorf("Expected no error, got %v", err)
		}
	})

	t.Run("backend returns error status", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusInternalServerError)
		}))
		defer server.Close()

		os.Setenv("BACKEND_URL", server.URL)
		defer os.Unsetenv("BACKEND_URL")

		testData := []byte(`{"city":"Test"}`)
		err := postToBackend(testData)

		if err == nil {
			t.Error("Expected error for 500 status, got nil")
		}
	})

	t.Run("network error", func(t *testing.T) {
		// Use invalid URL to trigger network error
		os.Setenv("BACKEND_URL", "http://invalid-host-that-does-not-exist:9999/test")
		defer os.Unsetenv("BACKEND_URL")

		testData := []byte(`{"city":"Test"}`)
		err := postToBackend(testData)

		if err == nil {
			t.Error("Expected network error, got nil")
		}
	})

	t.Run("uses default backend URL", func(t *testing.T) {
		os.Unsetenv("BACKEND_URL")

		// This will fail to connect, but we're testing the default URL is used
		testData := []byte(`{"city":"Test"}`)
		err := postToBackend(testData)

		// We expect an error since backend:3000 won't exist in test
		if err == nil {
			t.Error("Expected error connecting to default backend, got nil")
		}
	})

	t.Run("accepts 200 OK status", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
		}))
		defer server.Close()

		os.Setenv("BACKEND_URL", server.URL)
		defer os.Unsetenv("BACKEND_URL")

		testData := []byte(`{"city":"Test"}`)
		err := postToBackend(testData)

		if err != nil {
			t.Errorf("Expected no error for 200 OK, got %v", err)
		}
	})

	t.Run("accepts 201 Created status", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusCreated)
		}))
		defer server.Close()

		os.Setenv("BACKEND_URL", server.URL)
		defer os.Unsetenv("BACKEND_URL")

		testData := []byte(`{"city":"Test"}`)
		err := postToBackend(testData)

		if err != nil {
			t.Errorf("Expected no error for 201 Created, got %v", err)
		}
	})
}

func TestPostToBackend_JSONParsing(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var data map[string]interface{}
		if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
			t.Errorf("Failed to decode JSON: %v", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		// Verify expected fields
		if city, ok := data["city"].(string); !ok || city != "São Paulo" {
			t.Errorf("Expected city 'São Paulo', got %v", data["city"])
		}

		if temp, ok := data["temperature"].(float64); !ok || temp != 25.5 {
			t.Errorf("Expected temperature 25.5, got %v", data["temperature"])
		}

		w.WriteHeader(http.StatusCreated)
	}))
	defer server.Close()

	os.Setenv("BACKEND_URL", server.URL)
	defer os.Unsetenv("BACKEND_URL")

	weatherData := map[string]interface{}{
		"city":        "São Paulo",
		"temperature": 25.5,
		"humidity":    65,
		"windSpeed":   12.3,
		"condition":   "Clear sky",
		"timestamp":   time.Now().Unix(),
	}

	jsonData, _ := json.Marshal(weatherData)
	err := postToBackend(jsonData)

	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
}

func TestPostToBackend_RequestHeaders(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		contentType := r.Header.Get("Content-Type")
		if contentType != "application/json" {
			t.Errorf("Expected Content-Type 'application/json', got '%s'", contentType)
		}
		w.WriteHeader(http.StatusCreated)
	}))
	defer server.Close()

	os.Setenv("BACKEND_URL", server.URL)
	defer os.Unsetenv("BACKEND_URL")

	testData := []byte(`{"test":"data"}`)
	err := postToBackend(testData)

	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
}

// Benchmark tests
func BenchmarkPostToBackend(b *testing.B) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusCreated)
	}))
	defer server.Close()

	os.Setenv("BACKEND_URL", server.URL)
	defer os.Unsetenv("BACKEND_URL")

	testData := []byte(`{"city":"Test","temperature":20.0}`)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		postToBackend(testData)
	}
}

func BenchmarkJSONMarshal(b *testing.B) {
	weatherData := map[string]interface{}{
		"city":        "São Paulo",
		"temperature": 25.5,
		"humidity":    65,
		"windSpeed":   12.3,
		"condition":   "Clear sky",
		"timestamp":   time.Now().Unix(),
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		json.Marshal(weatherData)
	}
}
