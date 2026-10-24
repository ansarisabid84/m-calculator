import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getItem, setItem } from '../lib/storage.js';
import { setupStatusBar, setHapticsEnabled } from '../lib/native.js';
import { setFormatPrefs } from '../lib/format.js';

const Ctx = createContext(null);
const THEME_KEY = 'theme_mode_v2';
const HAPTIC_KEY = 'haptics_v1';
const FMT_KEY = 'format_v1';

// mode: 'auto' follows the system; 'light' / 'dark' are explicit.
export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState('auto');
  const [systemDark, setSystemDark] = useState(true);
  const [haptics, setHapticsState] = useState(true);
  const [fmt, setFmtState] = useState({ decimals: 10, grouping: true });

  useEffect(() => {
    (async () => {
      const saved = await getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark' || saved === 'auto') setModeState(saved);
      const h = await getItem(HAPTIC_KEY);
      if (h === '0') { setHapticsState(false); setHapticsEnabled(false); }
      try {
        const f = JSON.parse((await getItem(FMT_KEY)) || 'null');
        if (f) { setFormatPrefs(f); setFmtState(f); }
      } catch (_) { /* ignore */ }
    })();
    const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    if (!mq) return;
    setSystemDark(mq.matches);
    const on = (e) => setSystemDark(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const theme = mode === 'auto' ? (systemDark ? 'dark' : 'light') : mode;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    setupStatusBar(theme === 'dark');
  }, [theme]);

  const setMode = useCallback((m) => { setModeState(m); setItem(THEME_KEY, m); }, []);
  const toggle = useCallback(() => setMode(theme === 'dark' ? 'light' : 'dark'), [theme, setMode]);
  const setHaptics = useCallback((on) => {
    setHapticsState(on); setHapticsEnabled(on); setItem(HAPTIC_KEY, on ? '1' : '0');
  }, []);

  const setFmt = useCallback((patch) => {
    setFmtState((p) => { const n = { ...p, ...patch }; setFormatPrefs(n); setItem(FMT_KEY, JSON.stringify(n)); return n; });
  }, []);

  return (
    <Ctx.Provider value={{ theme, mode, setMode, toggle, haptics, setHaptics, fmt, setFmt }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTheme() {
  return useContext(Ctx);
}
