import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { AvatarUpload } from './AvatarUpload';

interface AvatarManageModalProps {
  open: boolean;
  onClose: () => void;
  src?: string | null;
  initials: string;
  title: string;
  uploading?: boolean;
  onUpload: (file: File) => void;
  onRemove?: () => void;
}

export function AvatarManageModal({
  open,
  onClose,
  src,
  initials,
  title,
  uploading = false,
  onUpload,
  onRemove,
}: AvatarManageModalProps) {
  return (
    <Dialog open={open} onClose={uploading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <IconButton size="small" onClick={onClose} disabled={uploading}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Stack spacing={3} sx={{ alignItems: 'center', py: 1 }}>
          <AvatarUpload
            src={src}
            initials={initials}
            size={120}
            uploading={uploading}
            onFileSelect={onUpload}
            onRemove={onRemove}
          />

          <Box sx={{ width: '100%' }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', textAlign: 'center', mb: 2 }}
            >
              Click the photo above to change it
            </Typography>

            {src && onRemove && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
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
}
