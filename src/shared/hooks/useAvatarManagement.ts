import { useCallback } from 'react';

import {
  useRemoveUserAvatarByAdminMutation,
  useUploadUserAvatarByAdminMutation,
} from '@/features/users/api/usersApi';
import type { ApiError, UserDto } from '@/types/api';

import { useItemDialog } from './useItemDialog';
import { useSnackbar } from './useSnackbar';

const useAvatarManagement = <T extends Pick<UserDto, 'id' | 'profileFileId'>>() => {
  const avatarDialog = useItemDialog<T>();
  const snackbar = useSnackbar();
  const [uploadUserAvatar, { isLoading: isUploadingAvatar }] = useUploadUserAvatarByAdminMutation();
  const [removeUserAvatar, { isLoading: isRemovingAvatar }] = useRemoveUserAvatarByAdminMutation();

  const handleUploadAvatar = useCallback(
    async (file: File) => {
      if (!avatarDialog.item) return;
      try {
        const updated = await uploadUserAvatar({ userId: avatarDialog.item.id, file }).unwrap();
        avatarDialog.setItem({ ...avatarDialog.item, profileFileId: updated.profileFileId });
        snackbar.success('Profile picture updated.');
      } catch (err) {
        snackbar.error((err as ApiError).message || 'Failed to upload avatar.');
      }
    },
    [avatarDialog, uploadUserAvatar, snackbar],
  );

  const handleRemoveAvatar = useCallback(async () => {
    if (!avatarDialog.item) return;
    try {
      const updated = await removeUserAvatar(avatarDialog.item.id).unwrap();
      avatarDialog.setItem({ ...avatarDialog.item, profileFileId: updated.profileFileId });
      snackbar.success('Profile picture removed.');
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to remove avatar.');
    }
  }, [avatarDialog, removeUserAvatar, snackbar]);

  return {
    avatarDialog,
    handleUploadAvatar,
    handleRemoveAvatar,
    isUploadingAvatar,
    isRemovingAvatar,
  };
};

export { useAvatarManagement };
