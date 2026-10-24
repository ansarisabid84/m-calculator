// memory.js — calculator memory register (M+, M−, MR, MC), persisted.
import { useState, useEffect, useCallback } from 'react';
import { getItem, setItem } from './storage.js';

const KEY = 'calc_memory_v1';

export function useMemory() {
  const [value, setValue] = useState(0);
  const [has, setHas] = useState(false);

  useEffect(() => {
    (async () => {
      const raw = await getItem(KEY);
      const n = raw === null ? NaN : parseFloat(raw);
      if (Number.isFinite(n)) { setValue(n); setHas(true); }
    })();
  }, []);

  const store = useCallback((n, h) => { setValue(n); setHas(h); setItem(KEY, h ? String(n) : ''); }, []);
  const add = useCallback((n) => store(value + n, true), [value, store]);
  const sub = useCallback((n) => store(value - n, true), [value, store]);
  const set = useCallback((n) => store(n, true), [store]);
  const clear = useCallback(() => store(0, false), [store]);

  return { value, has, add, sub, set, clear };
}
