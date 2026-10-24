// native.js — guards all Capacitor calls behind isNative() so the plain web
// build (and dev server) runs untouched. Mirrors the pattern from Ledger.

let _isNative = null;

export function isNative() {
  if (_isNative !== null) return _isNative;
  _isNative =
    typeof window !== 'undefined' &&
    window.Capacitor &&
    typeof window.Capacitor.isNativePlatform === 'function' &&
    window.Capacitor.isNativePlatform();
  return _isNative;
}

// Light haptic tap on keypress. No-op on web.
let _haptics = true;
export function setHapticsEnabled(on) { _haptics = !!on; }

export async function tapHaptic() {
  if (!isNative() || !_haptics) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (_) { /* haptics unavailable */ }
}

export async function setupStatusBar(isDark) {
  if (!isNative()) return;
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
  } catch (_) { /* ignore */ }
}

export async function hideSplash() {
  if (!isNative()) return;
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide();
  } catch (_) { /* ignore */ }
}

// Copy text to the clipboard and show a toast. Works on web and in the webview.
export async function copyText(text, label = 'Copied') {
  try {
    await navigator.clipboard.writeText(String(text));
    toast(label);
  } catch (_) {
    try {
      const ta = document.createElement('textarea');
      ta.value = String(text);
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      toast(label);
    } catch (__) { toast('Copy unavailable'); }
  }
}

export function toast(message) {
  window.dispatchEvent(new CustomEvent('app-toast', { detail: message }));
}
