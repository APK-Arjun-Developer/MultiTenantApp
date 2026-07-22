import { headerTitleSx, pageIconBoxSx } from '@/shared/theme/styleHelpers';
import type { StyleSheet } from '@/types';

const styles = {
  root: {},
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 2,
  },
  headerTitle: headerTitleSx,
  pageIconBox: pageIconBoxSx,
  titleText: {
    fontWeight: 700,
    letterSpacing: '-0.01em',
  },
  filterBar: {
    mb: 2,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
    py: 10,
    textAlign: 'center',
    color: 'text.disabled',
  },
  chipRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.5,
  },
  permissionChip: {
    mr: 0.5,
    mb: 0.5,
  },
  actionButtons: {
    display: 'flex',
    gap: 0.5,
  },
  viewDialogContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  formBuilder: {
    boxShadow: 'none',
    p: 0,
    bgcolor: 'transparent',
  },
  columnName: {
    fontWeight: 500,
  },
  pageIconSize: {
    fontSize: '1.125rem',
  },
} as const satisfies StyleSheet;

export { styles };
