import type { Sx } from '@/types/styles';

export const styles = {
  label: {
    mb: 0.25,
    display: 'block',
  },
} as const satisfies Record<string, Sx>;
