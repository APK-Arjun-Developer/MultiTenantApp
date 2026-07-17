import type { StyleSheet } from '@/types';

const styles = {
  paper: {
    overflow: 'hidden',
  },

  headerCell: {},

  sortableHeaderCell: {
    cursor: 'pointer',
    userSelect: 'none',
  },

  centeredCell: {
    textAlign: 'center',
    py: 8,
    border: 0,
  },

  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
  },

  emptyIcon: {
    fontSize: '2.25rem',
    color: 'text.disabled',
    opacity: 0.5,
  },

  paginationContainer: {
    borderTop: 1,
    borderColor: 'divider',
  },
} as const satisfies StyleSheet;

export { styles };
