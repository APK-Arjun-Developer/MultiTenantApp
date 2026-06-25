import { useRef, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CloseIcon from '@mui/icons-material/Close';

interface AvatarUploadProps {
  src?: string | null;
  initials: string;
  size?: number;
  uploading?: boolean;
  onFileSelect: (file: File) => void;
  onRemove?: () => void;
}

export function AvatarUpload({
  src,
  initials,
  size = 72,
  uploading = false,
  onFileSelect,
  onRemove,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hover, setHover] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      e.target.value = '';
    }
  };

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <Box
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => !uploading && inputRef.current?.click()}
        sx={{
          cursor: uploading ? 'default' : 'pointer',
          position: 'relative',
          borderRadius: '50%',
        }}
      >
        <Avatar
          src={src ?? undefined}
          slotProps={{ img: { crossOrigin: 'use-credentials' } }}
          sx={{ width: size, height: size, bgcolor: 'primary.main', fontSize: size * 0.33 }}
        >
          {!src && initials}
        </Avatar>

        {(hover || uploading) && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              bgcolor: 'rgba(0,0,0,0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {uploading ? (
              <CircularProgress size={size * 0.35} sx={{ color: 'white' }} />
            ) : (
              <CameraAltIcon sx={{ color: 'white', fontSize: size * 0.35 }} />
            )}
          </Box>
        )}
      </Box>

      {src && onRemove && !uploading && (
        <Tooltip title="Remove photo">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            sx={{
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
            }}
          >
            <CloseIcon sx={{ fontSize: 13 }} />
          </IconButton>
        </Tooltip>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </Box>
  );
}
