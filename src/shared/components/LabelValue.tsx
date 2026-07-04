import type { ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface LabelValueProps {
  label: string;
  value?: ReactNode;
  emptyText?: string;
  sx?: SxProps<Theme>;
}

export function LabelValue({ label, value, emptyText = '—', sx }: LabelValueProps) {
  const isEmpty = value === undefined || value === null || value === '';
  return (
    <Box sx={sx}>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.25, display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body2" color={isEmpty ? 'text.disabled' : 'text.primary'}>
        {isEmpty ? emptyText : value}
      </Typography>
    </Box>
  );
}
