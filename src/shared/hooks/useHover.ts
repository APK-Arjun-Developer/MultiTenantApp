import { useCallback, useState } from 'react';

const useHover = () => {
  const [hover, setHover] = useState(false);
  const onMouseEnter = useCallback(() => setHover(true), []);
  const onMouseLeave = useCallback(() => setHover(false), []);
  return { hover, onMouseEnter, onMouseLeave };
};

export { useHover };
