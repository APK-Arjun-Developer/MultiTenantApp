import { createBrowserRouter } from 'react-router-dom';
import App from '@/App';

// Placeholder single-route tree. Phase 4 replaces this with the full lazy-loaded
// route tree (login, dashboard, tenants, users, roles, products, reports) + AuthGuard.
export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
]);
