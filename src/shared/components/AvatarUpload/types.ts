interface AvatarUploadProps {
  src?: string | null;
  initials: string;
  size?: number;
  uploading?: boolean;
  onFileSelect: (file: File) => void;
}

export { type AvatarUploadProps };
