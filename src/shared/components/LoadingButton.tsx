import Box from '@mui/material/Box';
import Button, { type ButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
}

export function LoadingButton({
  loading = false,
  children,
  disabled,
  sx,
  ...rest
}: LoadingButtonProps) {
  return (
    <Button disabled={loading || disabled} sx={{ position: 'relative', ...sx }} {...rest}>
      <Box component="span" sx={{ visibility: loading ? 'hidden' : 'visible' }}>
        {children}
      </Box>
      {loading && (
        <CircularProgress
          size={16}
          color="inherit"
          sx={{ position: 'absolute', left: '50%', top: '50%', mt: '-8px', ml: '-8px' }}
        />
      )}
    </Button>
  );
}
