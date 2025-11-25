# React Frontend

Modern React + Vite dashboard for GDASH system.

## Features

### Authentication

- Login/Register
- JWT token
- Protected routes

### Dashboard

- Real-time data visualization
- Interactive charts (Recharts)
- Statistics cards
- AI insights
- CSV/XLSX export

### User Management

- List users
- Edit/Delete
- Active/inactive status

## Local Development

### Prerequisites

```bash
npm install
```

### Development

```bash
npm run dev
```

Access: http://localhost:5173

### Build

```bash
npm run build
npm run preview
```

## Docker

### Development

```bash
docker build --target development -t gdash-react-dev .
docker run -p 5173:5173 gdash-react-dev
```

### Production

```bash
docker build --target production -t gdash-react-prod .
docker run -p 80:80 gdash-react-prod
```

## Tech Stack

- React 18
- Vite
- TypeScript
- React Router
- TanStack Query
- Zustand
- Recharts
- Axios
- Lucide React

## Structure

```
src/
├── api/           # API config
├── components/    # Reusable components
├── pages/         # Páginas da aplicação
├── store/         # Estado global (Zustand)
├── App.tsx        # App principal
└── main.tsx       # Entry point
```

## ⚙️ Variáveis de Ambiente

- `VITE_API_URL`: URL da API (padrão: http://localhost:3000)
