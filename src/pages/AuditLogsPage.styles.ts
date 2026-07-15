import type { StyleSheet } from '@/types';

export const styles = {
  root: {},
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 3,
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
  },
  pageIconBox: {
    width: 32,
    height: 32,
    borderRadius: 1.5,
    background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    flexShrink: 0,
    boxShadow: '0 0 12px rgba(124,58,237,0.3)',
  },
  titleText: {
    fontWeight: 700,
    letterSpacing: '-0.01em',
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
