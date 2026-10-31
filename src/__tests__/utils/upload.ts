import { screen, within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { vi } from 'vitest';

interface CanvasMockOptions {
  /** Make canvas.toBlob yield null, as browsers do when encoding fails. */
  toBlobFails?: boolean;
}

/**
 * jsdom can't decode images or draw on a canvas. Stub just enough for AvatarUpload's crop:
 * images "load" as 200x100, the 2d context records drawImage, toBlob returns a JPEG blob.
 * Restore with vi.unstubAllGlobals() / vi.restoreAllMocks().
 */
const mockImageCanvas = ({ toBlobFails = false }: CanvasMockOptions = {}) => {
  class LoadedImage {
    naturalWidth = 200;
    naturalHeight = 100;
    onload: (() => void) | null = null;
    onerror: ((e: unknown) => void) | null = null;
    set src(_value: string) {
      setTimeout(() => this.onload?.(), 0);
    }
  }
  vi.stubGlobal('Image', LoadedImage);

  const drawImage = vi.fn();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    drawImage,
  } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => {
    callback(toBlobFails ? null : new Blob(['jpeg'], { type: 'image/jpeg' }));
  });
  return { drawImage };
};

/** Picks `file` in the (only) avatar file input and confirms the crop dialog. */
const uploadAndCrop = async (
  user: UserEvent,
  file = new File(['png'], 'photo.png', { type: 'image/png' }),
) => {
  const input = document.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) throw new Error('No file input rendered');
  await user.upload(input, file);
  const dialog = await screen.findByRole('dialog', { name: 'Crop photo' });
  await user.click(within(dialog).getByRole('button', { name: 'Apply' }));
};

export { mockImageCanvas, uploadAndCrop };
