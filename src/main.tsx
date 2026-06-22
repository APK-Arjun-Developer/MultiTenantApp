import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { registerFieldType } from 'mui-schema-form-builder';
import './index.css';
import { AppProviders } from './app/providers';
import { router } from './app/router';
import { PasswordField, PASSWORD_FIELD } from './shared/components/PasswordField';

registerFieldType(PASSWORD_FIELD, PasswordField);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);
