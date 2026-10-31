import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/__tests__/utils/renderWithProviders';
import { mockImageCanvas, uploadAndCrop } from '@/__tests__/utils/upload';

import AvatarUpload from '.';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const renderUpload = (props: Partial<React.ComponentProps<typeof AvatarUpload>> = {}) => {
  const onFileSelect = vi.fn();
  const view = renderWithProviders(
    <AvatarUpload initials="JD" onFileSelect={onFileSelect} {...props} />,
  );
  return { ...view, onFileSelect };
};

const fileInput = () =>
  document.querySelector<HTMLInputElement>('input[type="file"]') as HTMLInputElement;

describe('AvatarUpload', () => {
  it('shows initials without a photo', () => {
    renderUpload();

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('crops the picked image to a centred square JPEG', async () => {
    const { drawImage } = mockImageCanvas();
    const { user, onFileSelect } = renderUpload();

    await uploadAndCrop(user);

    await waitFor(() => expect(onFileSelect).toHaveBeenCalledTimes(1));
    const file = onFileSelect.mock.calls[0][0] as File;
    expect(file.name).toBe('avatar.jpg');
    expect(file.type).toBe('image/jpeg');
    // 200x100 image, no usable crop area yet: centre a 100x100 square.
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 50, 0, 100, 100, 0, 0, 100, 100);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('tells the user when the image cannot be processed', async () => {
    mockImageCanvas({ toBlobFails: true });
    const { user, onFileSelect } = renderUpload();

    await uploadAndCrop(user);

    expect(
      await screen.findByText('Could not process this image. Please try a different file.'),
    ).toBeInTheDocument();
    expect(onFileSelect).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Crop photo' })).not.toBeInTheDocument(),
    );
  });

  it('cancels the crop without selecting a file', async () => {
    mockImageCanvas();
    const { user, onFileSelect } = renderUpload();

    await user.upload(fileInput(), new File(['png'], 'photo.png', { type: 'image/png' }));
    const dialog = await screen.findByRole('dialog', { name: 'Crop photo' });
    fireEvent.change(within(dialog).getByRole('slider'), { target: { value: 2 } });
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it('opens the file picker on click, but not while uploading', async () => {
    const { user, rerender, onFileSelect } = renderUpload();
    const pick = vi.spyOn(fileInput(), 'click');

    await user.click(screen.getByText('JD'));
    expect(pick).toHaveBeenCalledTimes(1);

    rerender(<AvatarUpload initials="JD" onFileSelect={onFileSelect} uploading />);
    await user.click(screen.getByText('JD'));
    expect(pick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('ignores an empty file selection', () => {
    renderUpload();

    fireEvent.change(fileInput(), { target: { files: [] } });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
