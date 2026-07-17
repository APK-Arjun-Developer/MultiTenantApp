import type { ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';

interface LabelValueProps {
  label: string;
  value?: ReactNode;
  emptyText?: string;
  sx?: SxProps<Theme>;
}

export { type LabelValueProps };
