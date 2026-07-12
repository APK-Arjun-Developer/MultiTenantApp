// ─── Component prop types ──────────────────────────────────────────────────────

import type React from 'react';

export type StatCardColor = 'primary' | 'secondary' | 'warning' | 'error' | 'success' | 'info';

export interface StatCardProps {
  label: string;
  value: number | null | undefined;
  icon: React.ReactNode;
  color?: StatCardColor;
  isLoading: boolean;
}
