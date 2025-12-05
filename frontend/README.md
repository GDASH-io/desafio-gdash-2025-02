# Weather Frontend — Full

This frontend shows real-time weather data, history, charts and includes a simple login flow.
Set the API base url via environment variable `VITE_API_URL` (default: http://localhost:3000).

## Run locally
1. npm install
2. npm run dev

## Run with Docker
- Build and run with docker-compose configured in the project root, or:
  docker build -t weather-frontend .
  docker run -p 5173:5173 weather-frontend
