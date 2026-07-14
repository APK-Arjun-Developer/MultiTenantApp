import type { Sx } from '@/types/styles';

export const styles = {
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    py: 12,
    gap: 1.5,
    textAlign: 'center',
  },

  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 3,
    background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(124,58,237,0.06) 100%)',
    border: '1px solid rgba(124,58,237,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    mb: 0.5,
  },

  icon: {
    fontSize: '2rem',
    color: 'primary.main',
    opacity: 0.75,
  },

  heading: {
    fontWeight: 600,
    color: 'text.primary',
  },

  body: {
    maxWidth: 300,
    color: 'text.secondary',
  },
} as const satisfies Record<string, Sx>;
