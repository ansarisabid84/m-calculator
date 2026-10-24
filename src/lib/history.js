// history.js — a tiny React hook that keeps a rolling list of calculations,
// persisted through the storage layer.

import { useState, useEffect, useCallback, useRef } from 'react';
import { getItem, setItem } from './storage.js';

const KEY = 'calc_history_v1';
const MAX = 50;

export function useHistory() {
  const [items, setItems] = useState([]);
  const loaded = useRef(false);

  useEffect(() => {
    (async () => {
      const raw = await getItem(KEY);
      if (raw) {
        try { setItems(JSON.parse(raw)); } catch (_) { /* ignore */ }
      }
      loaded.current = true;
    })();
  }, []);

  const persist = useCallback((next) => {
    setItems(next);
    setItem(KEY, JSON.stringify(next));
  }, []);

  const add = useCallback((expr, result) => {
    setItems((prev) => {
      const next = [{ expr, result, at: Date.now() }, ...prev].slice(0, MAX);
      setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clear = useCallback(() => persist([]), [persist]);

  return { items, add, clear };
}
