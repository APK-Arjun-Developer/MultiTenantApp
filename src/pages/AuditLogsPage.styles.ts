import type { StyleSheet } from '@/types';

const styles = {
  root: {},
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    mb: 2,
  },
  filterBar: {
    mb: 2,
  },
  timeCell: {
    whiteSpace: 'nowrap',
  },
  actionCell: {
    fontWeight: 500,
  },
  descriptionCell: {
    maxWidth: 360,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  pageIconSize: {
    fontSize: '1.125rem',
  },
} as const satisfies StyleSheet;

export { styles };
