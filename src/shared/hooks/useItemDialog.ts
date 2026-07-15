import { useState, useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export function useItemDialog<T>(): {
  item: T | null;
  open: boolean;
  onOpen: (value: T) => void;
  onClose: () => void;
  setItem: Dispatch<SetStateAction<T | null>>;
} {
  const [item, setItem] = useState<T | null>(null);
  const onOpen = useCallback((value: T) => setItem(value), []);
  const onClose = useCallback(() => setItem(null), []);
  return { item, open: item !== null, onOpen, onClose, setItem };
}
