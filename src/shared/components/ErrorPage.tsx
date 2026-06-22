import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  let message = 'An unexpected error occurred.';
  if (isRouteErrorResponse(error)) {
    message = typeof error.data === 'string' ? error.data : error.statusText;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
        p: 3,
        textAlign: 'center',
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        Something went wrong
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 480 }}>
        {message}
      </Typography>
      <Button variant="contained" onClick={() => navigate('/dashboard', { replace: true })}>
        Back to Dashboard
      </Button>
    </Box>
  );
}
