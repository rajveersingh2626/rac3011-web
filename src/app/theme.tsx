import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Theme = 'light' | 'dark';
export type ThemePreference = Theme | 'system';
export const THEME_STORAGE_KEY = 'rac3011.theme';

interface ThemeContextValue {
  theme: Theme;
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemTheme(): Theme {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function readStored(): ThemePreference | null {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    return v === 'light' || v === 'dark' || v === 'system' ? v : null;
  } catch {
    return null;
  }
}

export function resolveTheme(pref: ThemePreference): Theme {
  return pref === 'system' ? systemTheme() : pref;
}

interface Props {
  children: ReactNode;
  profilePreference?: ThemePreference | null;
  onPersist?: (pref: ThemePreference) => void;
}

export function ThemeProvider({ children, profilePreference, onPersist }: Props) {
  const [preference, setPref] = useState<ThemePreference>(() => profilePreference ?? readStored() ?? 'system');
  const [system, setSystem] = useState<Theme>(systemTheme);

  useEffect(() => {
    if (profilePreference) setPref(profilePreference);
  }, [profilePreference]);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const onChange = () => setSystem(systemTheme());
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const theme: Theme = preference === 'system' ? system : preference;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setPreference = useCallback(
    (pref: ThemePreference) => {
      setPref(pref);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, pref);
      } catch {
        /* storage unavailable */
      }
      onPersist?.(pref);
    },
    [onPersist],
  );

  const toggle = useCallback(() => setPreference(theme === 'dark' ? 'light' : 'dark'), [theme, setPreference]);

  const value = useMemo(() => ({ theme, preference, setPreference, toggle }), [theme, preference, setPreference, toggle]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
