import React, { useCallback, useRef, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slider from '@mui/material/Slider';

import { AVATAR_IMG_SLOT_PROPS } from '@/shared/constants/avatarProps';
import { useHover } from '@/shared/hooks';

import Icon from '../Icon';
import { hiddenInputStyle, styles } from './styles';
import type { AvatarUploadProps } from './types';

const OUTPUT_SIZE = 512;
const MIN_VALID_PX = 16;

const getCroppedBlob = async (imageSrc: string, pixelCrop: Area | null): Promise<Blob> => {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });

  const imgW = image.naturalWidth;
  const imgH = image.naturalHeight;

  let sx: number, sy: number, sSize: number;

  const cropOk =
    pixelCrop !== null && pixelCrop.width >= MIN_VALID_PX && pixelCrop.height >= MIN_VALID_PX;

  if (cropOk && pixelCrop) {
    sSize = Math.min(pixelCrop.width, pixelCrop.height, imgW, imgH);
    sx = Math.max(0, Math.min(pixelCrop.x, imgW - sSize));
    sy = Math.max(0, Math.min(pixelCrop.y, imgH - sSize));
  } else {
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
};

const AvatarUpload = React.memo(
  ({ src, initials, size = 72, uploading = false, onFileSelect }: AvatarUploadProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { hover, onMouseEnter, onMouseLeave } = useHover();

    const [cropSrc, setCropSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const handleClick = useCallback(() => {
      if (!uploading) inputRef.current?.click();
    }, [uploading]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
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
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={handleClick}
            sx={clickableSx}
          >
            <Avatar src={src ?? undefined} slotProps={AVATAR_IMG_SLOT_PROPS} sx={avatarSx}>
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
  },
);
export default AvatarUpload;
