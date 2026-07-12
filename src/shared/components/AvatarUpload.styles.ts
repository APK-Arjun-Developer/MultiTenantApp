import type { SxProps, Theme } from '@mui/material/styles';
type Sx = SxProps<Theme>;

export const styles = {
  outerBox: {
    position: 'relative',
    display: 'inline-flex',
    flexShrink: 0,
  } as Sx,
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
  } as Sx,
  overlaySpinner: (_size: number): Sx => ({
    color: 'white',
  }),
  overlayIcon: (size: number): Sx => ({
    color: 'white',
    fontSize: size * 0.35,
  }),
  removeButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 22,
    height: 22,
    bgcolor: 'background.paper',
    border: '1px solid',
    borderColor: 'divider',
    '&:hover': {
      bgcolor: 'error.lighter',
      borderColor: 'error.main',
      color: 'error.main',
    },
  } as Sx,
  removeIcon: {
    fontSize: 13,
  } as Sx,
  cropDialogContent: {
    p: 0,
  } as Sx,
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
  } as Sx,
  dialogActions: {
    px: 3,
    pb: 2,
  } as Sx,
} as const;
