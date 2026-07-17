import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import LoadingButton from './LoadingButton';
import type { ConfirmDialogProps } from './ConfirmDialog.types';
import { styles } from './ConfirmDialog.styles';

const ConfirmDialog = React.memo(
  ({
    open,
    title,
    description,
    confirmLabel = 'Confirm',
    danger = false,
    loading = false,
    onConfirm,
    onCancel,
  }: ConfirmDialogProps) => {
    return (
      <Dialog open={open} onClose={loading ? undefined : onCancel} maxWidth="xs" fullWidth>
        <DialogTitle>{title}</DialogTitle>
        {description && (
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </DialogContent>
        )}
        <DialogActions sx={styles.dialogActions}>
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <LoadingButton
            onClick={onConfirm}
            variant="contained"
            color={danger ? 'error' : 'primary'}
            loading={loading}
          >
            {confirmLabel}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    );
  },
);
export default ConfirmDialog;
