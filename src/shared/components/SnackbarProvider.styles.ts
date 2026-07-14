import type { Sx } from '@/types/styles';

export const styles = {
  alert: {
    width: '100%',
    minWidth: 280,
  },
} as const satisfies Record<string, Sx>;
