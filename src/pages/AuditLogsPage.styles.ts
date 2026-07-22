import { headerTitleSx, pageIconBoxSx } from '@/shared/theme/styleHelpers';
import type { StyleSheet } from '@/types';

const styles = {
  root: {},
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 3,
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
