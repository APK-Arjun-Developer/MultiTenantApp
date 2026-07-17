import type { StyleSheet } from '@/types';

const styles = {
  formControl: {
    minWidth: 180,
    maxWidth: 260,
  },

  select: {
    fontSize: '0.8125rem',
    fontWeight: 500,
    borderRadius: '6px !important',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'divider',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'text.disabled',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'primary.main',
      borderWidth: '1.5px',
    },
  },

  renderValueBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    py: 0.125,
  },

  renderValueDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    bgcolor: 'primary.light',
    flexShrink: 0,
  },

  renderValueText: {
    fontWeight: 500,
    fontSize: '0.8125rem',
    color: 'text.primary',
  },

  platformMenuItem: {
    fontStyle: 'italic',
    color: 'text.secondary',
  },

  tenantMenuItemText: {
    fontWeight: 500,
    fontSize: '0.875rem',
  },

  loadingSpinner: {
    mx: 1,
    color: 'text.secondary',
  },
} as const satisfies StyleSheet;

export { styles };
