import { useEffect } from 'react';
import { useMatches } from 'react-router-dom';

const APP_NAME = 'MultiTenant Admin';

export function usePageTitle() {
  const matches = useMatches();

  useEffect(() => {
    const match = [...matches].reverse().find((m) => (m.handle as { title?: string })?.title);
    const title = (match?.handle as { title?: string })?.title;
    document.title = title ? `${title} | ${APP_NAME}` : APP_NAME;
  }, [matches]);
}
