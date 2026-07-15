import React, { useCallback } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AvatarUpload } from './AvatarUpload';
import type { AvatarManageModalProps } from './AvatarManageModal.types';
import { styles } from './AvatarManageModal.styles';
import { Icon } from '@/shared/components/Icon';

export const AvatarManageModal = React.memo(function AvatarManageModal({
  open,
  onClose,
  src,
  initials,
  title,
  uploading = false,
  onUpload,
  onRemove,
}: AvatarManageModalProps) {
  const handleClose = useCallback(() => {
    if (!uploading) onClose();
  }, [uploading, onClose]);

  return (
    <Dialog open={open} onClose={uploading ? undefined : handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={styles.dialogTitle}>
        <Typography variant="subtitle1" sx={styles.titleText}>
          {title}
        </Typography>
        <IconButton size="small" onClick={onClose} disabled={uploading}>
          <Icon name="Close" fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Stack spacing={3} sx={styles.stack}>
          <AvatarUpload
            src={src}
            initials={initials}
            size={120}
            uploading={uploading}
            onFileSelect={onUpload}
            onRemove={onRemove}
          />

          <Box sx={styles.captionBox}>
            <Typography variant="caption" color="text.secondary" sx={styles.caption}>
              Click the photo above to change it
            </Typography>

            {src && onRemove && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<Icon name="Delete" />}
                fullWidth
                disabled={uploading}
                onClick={onRemove}
              >
                Remove photo
              </Button>
            )}
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
});
