import type { Sx } from '@/types/styles';

export const styles = {
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
} as const satisfies Record<string, Sx>;
