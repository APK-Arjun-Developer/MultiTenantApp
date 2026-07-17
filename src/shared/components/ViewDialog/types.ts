import type { ReactNode } from 'react';

interface ViewDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export { type ViewDialogProps };
