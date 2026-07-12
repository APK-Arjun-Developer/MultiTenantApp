import React, { useCallback } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import type { ViewDialogProps } from './ViewDialog.types';
import { styles } from './ViewDialog.styles';

export const ViewDialog = React.memo(function ViewDialog({
  open,
  title,
  onClose,
  children,
}: ViewDialogProps) {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      <DialogActions sx={styles.dialogActions}>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
});
