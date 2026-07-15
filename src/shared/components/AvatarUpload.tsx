import React, { useCallback, useRef, useState } from 'react';
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
import type { AvatarUploadProps } from './AvatarUpload.types';
import { styles, hiddenInputStyle } from './AvatarUpload.styles';
import { Icon } from '@/shared/components/Icon';

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
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2d canvas context unavailable');
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

export const AvatarUpload = React.memo(function AvatarUpload({
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

  const handleMouseEnter = useCallback(() => setHover(true), []);
  const handleMouseLeave = useCallback(() => setHover(false), []);

  const handleClick = useCallback(() => {
    if (!uploading) inputRef.current?.click();
  }, [uploading]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
  }, []);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleCropConfirm = useCallback(async () => {
    if (!cropSrc) return;
    const blob = await getCroppedBlob(cropSrc, croppedAreaPixels);
    const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
    setCropSrc(null);
    onFileSelect(file);
  }, [cropSrc, croppedAreaPixels, onFileSelect]);

  const handleCropCancel = useCallback(() => {
    setCropSrc(null);
    setCroppedAreaPixels(null);
  }, []);

  const handleRemoveClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove?.();
    },
    [onRemove],
  );

  const handleSliderChange = useCallback((_e: Event, v: number | number[]) => {
    setZoom(v as number);
  }, []);

  const overlayIconSx = styles.overlayIcon(size);
  const overlaySpinnerSx = styles.overlaySpinner(size);
  const avatarSx = styles.avatar(size);
  const clickableSx = styles.clickable(uploading);

  return (
    <>
      <Box sx={styles.outerBox}>
        <Box
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          sx={clickableSx}
        >
          <Avatar
            src={src ?? undefined}
            slotProps={{ img: { crossOrigin: 'use-credentials' } }}
            sx={avatarSx}
          >
            {!src && initials}
          </Avatar>

          {(hover || uploading) && (
            <Box sx={styles.overlay}>
              {uploading ? (
                <CircularProgress size={size * 0.35} sx={overlaySpinnerSx} />
              ) : (
                <Icon name="CameraAlt" sx={overlayIconSx} />
              )}
            </Box>
          )}
        </Box>

        {src && onRemove && !uploading && (
          <Tooltip title="Remove photo">
            <IconButton size="small" onClick={handleRemoveClick} sx={styles.removeButton}>
              <Icon name="Close" sx={styles.removeIcon} />
            </IconButton>
          </Tooltip>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          style={hiddenInputStyle}
          onChange={handleFileChange}
        />
      </Box>

      {/* Crop dialog */}
      <Dialog open={!!cropSrc} maxWidth="xs" fullWidth>
        <DialogTitle>Crop photo</DialogTitle>
        <DialogContent sx={styles.cropDialogContent}>
          <Box sx={styles.cropBox('#111')}>
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
          <Box sx={styles.sliderBox}>
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.05}
              onChange={handleSliderChange}
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={styles.dialogActions}>
          <Button onClick={handleCropCancel}>Cancel</Button>
          <Button variant="contained" onClick={handleCropConfirm}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});
