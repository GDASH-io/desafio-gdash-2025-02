# Frontend Documentation

## Overview
React + Vite application with TypeScript, Tailwind CSS, and shadcn/ui components.

## Tech Stack
- **Framework:** React 19
- **Build Tool:** Vite 7
- **Language:** TypeScript
- **Styling:** Tailwind CSS 3
- **UI Components:** shadcn/ui
- **Routing:** React Router DOM 7
- **Charts:** Recharts 3
- **HTTP Client:** Axios
- **Testing:** Vitest + React Testing Library

## Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   └── ui/          # shadcn/ui components
│   ├── pages/           # Page components
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   └── Users.tsx
│   ├── lib/
│   │   └── utils.ts     # Utility functions
│   ├── test/
│   │   └── setup.ts     # Test configuration
│   ├── App.tsx          # Main app with routing
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
└── vite.config.ts       # Vite configuration
```

## Components

### UI Components (shadcn/ui)
- **Button:** Customizable button with variants
- **Input:** Form input with validation
- **Card:** Container for content sections

### Pages

#### Login (`/login`)
- Email/password authentication
- JWT token storage
- Error handling
- Redirects to dashboard on success

#### Dashboard (`/dashboard`)
- Weather data visualization
- Temperature/humidity charts (Recharts)
- AI insights display
- Export functionality (CSV/XLSX)
- Protected route (requires authentication)

#### Users (`/users`)
- List all users
- Create new users
- Protected route (requires authentication)

## Routing

```typescript
/ → Redirect to /dashboard
/login → Login page
/dashboard → Dashboard (protected)
/users → Users management (protected)
```

### Protected Routes
Routes wrapped in `ProtectedRoute` component check for JWT token in localStorage.

## State Management

### Authentication
- JWT token stored in `localStorage` with key `'token'`
- Token included in all API requests via Axios

### API Integration
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Example: Fetch weather logs
const response = await axios.get(`${API_URL}/weather/logs`, {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});
```

## Environment Variables

Create `.env` file:
```bash
VITE_API_URL=http://localhost:3000
```

## Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```
Access at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Run Tests
```bash
npm test
```

### Lint
```bash
npm run lint
```

## Testing

### Test Structure
```
src/
└── pages/
    ├── Login.tsx
    └── Login.test.tsx
```

### Example Test
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';

test('renders login form', () => {
  render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
  
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
});
```

## Styling

### Tailwind Configuration
Custom theme with CSS variables for shadcn/ui compatibility.

### Custom Classes
```typescript
import { cn } from '@/lib/utils';

<div className={cn('base-class', conditionalClass && 'conditional')} />
```

## Error Handling

### API Errors
```typescript
try {
  const response = await axios.post('/auth/login', { email, password });
  // Handle success
} catch (error: any) {
  if (error.response?.data?.message) {
    setError(error.response.data.message);
  } else {
    setError('An error occurred');
  }
}
```

## Accessibility
- Semantic HTML elements
- ARIA labels on form inputs
- Keyboard navigation support
- Focus management

## Performance
- Code splitting via React Router
- Lazy loading for routes
- Optimized bundle size with Vite
- Tree shaking enabled

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ features
- No IE11 support
