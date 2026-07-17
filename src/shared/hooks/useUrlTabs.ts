import { useMemo, useCallback, type SyntheticEvent } from 'react';
import { useSearchParams } from 'react-router-dom';

const useUrlTabs = <T extends readonly string[]>(tabs: T) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const tab = useMemo(() => {
    const idx = (tabs as readonly string[]).indexOf(searchParams.get('tab') ?? '');
    return idx >= 0 ? idx : 0;
  }, [searchParams, tabs]);

  const handleTabChange = useCallback(
    (_: SyntheticEvent, v: number) => {
      setSearchParams({ tab: tabs[v] }, { replace: true });
    },
    [setSearchParams, tabs],
  );

  return { tab, handleTabChange };
};

export { useUrlTabs };
