import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)


// TODO query: db.weather_logs.aggregate([ { $group: { _id: {$dateToString: {format: "%Y-%m-%d", date: "$createdAt"}}, temperatures: {$push: "$temperature"}}}, {$sort: {_id: 1}}])