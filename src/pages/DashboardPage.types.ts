// â”€â”€â”€ Component prop types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import type React from 'react';

type StatCardColor = 'primary' | 'secondary' | 'warning' | 'error' | 'success' | 'info';

interface StatCardProps {
  label: string;
  value: number | null | undefined;
  icon: React.ReactNode;
  color?: StatCardColor;
  isLoading: boolean;
}

export { type StatCardColor, type StatCardProps };
