import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { DEFAULT_DISTRICT, isDistrictId, type DistrictId } from '@/constants/districts';

export const DISTRICT_STORAGE_KEY = 'ooru:district';

interface DistrictContextValue {
  district: DistrictId;
  setDistrict: (district: DistrictId) => void;
}

const DistrictContext = createContext<DistrictContextValue | null>(null);

/**
 * Holds the selected district and remembers it across launches.
 * It's the only state shared between screens, so a small Context is enough;
 * no Redux or Zustand needed.
 */
export function DistrictProvider({ children }: { children: ReactNode }) {
  // null = still reading the saved value. We wait for it so the feed never
  // fetches the default district and then immediately switches.
  const [district, setDistrictState] = useState<DistrictId | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(DISTRICT_STORAGE_KEY)
      .then((saved) => setDistrictState(isDistrictId(saved) ? saved : DEFAULT_DISTRICT))
      .catch(() => setDistrictState(DEFAULT_DISTRICT));
  }, []);

  const setDistrict = useCallback((next: DistrictId) => {
    setDistrictState(next);
    // Saving is best-effort: if it fails, the app still works for this session.
    AsyncStorage.setItem(DISTRICT_STORAGE_KEY, next).catch(() => {});
  }, []);

  const value = useMemo(() => (district ? { district, setDistrict } : null), [district, setDistrict]);

  if (!value) return null;
  return <DistrictContext.Provider value={value}>{children}</DistrictContext.Provider>;
}

export function useDistrict(): DistrictContextValue {
  const value = useContext(DistrictContext);
  if (!value) throw new Error('useDistrict must be used inside <DistrictProvider>');
  return value;
}
