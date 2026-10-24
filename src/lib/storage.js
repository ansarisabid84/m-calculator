// storage.js — async key/value storage. Uses Capacitor Preferences on device,
// localStorage on the web. All callers await, so the backend is swappable.

import { isNative } from './native.js';

export async function getItem(key) {
  if (isNative()) {
    try {
      const { Preferences } = await import('@capacitor/preferences');
      const { value } = await Preferences.get({ key });
      return value ?? null;
    } catch (_) { return null; }
  }
  try {
    return window.localStorage.getItem(key);
  } catch (_) { return null; }
}

export async function setItem(key, value) {
  if (isNative()) {
    try {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({ key, value });
      return;
    } catch (_) { /* fall through */ }
  }
  try {
    window.localStorage.setItem(key, value);
  } catch (_) { /* quota / private mode */ }
}

export async function removeItem(key) {
  if (isNative()) {
    try {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.remove({ key });
      return;
    } catch (_) { /* fall through */ }
  }
  try {
    window.localStorage.removeItem(key);
  } catch (_) { /* ignore */ }
}
