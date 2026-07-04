import { useCallback, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
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

const OUTPUT_SIZE = 512;
const MIN_VALID_PX = 16; // discard crop values smaller than this — they're bogus initial fires

async function getCroppedBlob(imageSrc: string, pixelCrop: Area | null): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });

  const imgW = image.naturalWidth;
  const imgH = image.naturalHeight;

  let sx: number, sy: number, sSize: number;

  // Use pixelCrop only if both dimensions look plausible (>= MIN_VALID_PX and roughly square)
  const cropOk =
    pixelCrop !== null && pixelCrop.width >= MIN_VALID_PX && pixelCrop.height >= MIN_VALID_PX;

  if (cropOk && pixelCrop) {
    // Force square from the smaller dimension; clamp to image bounds
    sSize = Math.min(pixelCrop.width, pixelCrop.height, imgW, imgH);
    sx = Math.max(0, Math.min(pixelCrop.x, imgW - sSize));
    sy = Math.max(0, Math.min(pixelCrop.y, imgH - sSize));
  } else {
    // Fallback: centered square crop using the full shorter side
    sSize = Math.min(imgW, imgH);
    sx = Math.floor((imgW - sSize) / 2);
    sy = Math.floor((imgH - sSize) / 2);
  }

  const outSize = Math.min(sSize, OUTPUT_SIZE);

  const canvas = document.createElement('canvas');
  canvas.width = outSize;
  canvas.height = outSize;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(image, sx, sy, sSize, sSize, 0, 0, outSize, outSize);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      },
      'image/jpeg',
      0.9,
    );
  });
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

  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      // Reset all crop state before showing new image
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setCropSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleCropConfirm = async () => {
    if (!cropSrc) return;
    const blob = await getCroppedBlob(cropSrc, croppedAreaPixels);
    const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
    setCropSrc(null);
    onFileSelect(file);
  };

  const handleCropCancel = () => {
    setCropSrc(null);
    setCroppedAreaPixels(null);
  };

  return (
    <>
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

      {/* Crop dialog */}
      <Dialog open={!!cropSrc} maxWidth="xs" fullWidth>
        <DialogTitle>Crop photo</DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ position: 'relative', width: '100%', height: 300, bgcolor: '#111' }}>
            {cropSrc && (
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </Box>
          <Box sx={{ px: 3, pt: 2, pb: 1 }}>
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.05}
              onChange={(_e, v) => setZoom(v as number)}
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCropCancel}>Cancel</Button>
          <Button variant="contained" onClick={handleCropConfirm}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
