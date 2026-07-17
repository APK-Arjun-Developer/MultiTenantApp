import type { Sx } from '@/types';

const styles = {
  outerBox: {
    position: 'relative',
    display: 'inline-flex',
    flexShrink: 0,
  },
  clickable: (uploading: boolean): Sx => ({
    cursor: uploading ? 'default' : 'pointer',
    position: 'relative',
    borderRadius: '50%',
  }),
  avatar: (size: number): Sx => ({
    width: size,
    height: size,
    bgcolor: 'primary.main',
    fontSize: size * 0.33,
  }),
  overlay: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    bgcolor: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlaySpinner: (_size: number): Sx => ({
    color: 'white',
  }),
  overlayIcon: (size: number): Sx => ({
    color: 'white',
    fontSize: size * 0.35,
  }),
  cropDialogContent: {
    p: 0,
  },
  cropBox: (bgcolor: string): Sx => ({
    position: 'relative',
    width: '100%',
    height: 300,
    bgcolor,
  }),
  sliderBox: {
    px: 3,
    pt: 2,
    pb: 1,
  },
  dialogActions: {
    px: 3,
    pb: 2,
  },
} as const;

const hiddenInputStyle = { display: 'none' } as const;

export { hiddenInputStyle, styles };
