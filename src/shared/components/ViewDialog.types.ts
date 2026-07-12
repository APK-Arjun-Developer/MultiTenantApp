import type { ReactNode } from 'react';

export interface ViewDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}
