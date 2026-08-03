import { useMatches } from 'react-router-dom';

import type { IconName } from '@/shared/components';

interface PageHandle {
  title?: string;
  icon?: IconName;
}

/**
 * Reads the `title` + `icon` from the deepest matched route `handle`.
 * Used to render the page header (icon + title) centrally in the app bar
 * instead of repeating it on every page.
 */
const usePageHeader = (): { title?: string; icon?: IconName } => {
  const matches = useMatches();
  const match = [...matches].reverse().find((m) => (m.handle as PageHandle)?.title);
  const handle = match?.handle as PageHandle | undefined;
  return { title: handle?.title, icon: handle?.icon };
};

export { usePageHeader };
