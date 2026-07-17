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

export { type AvatarManageModalProps };
