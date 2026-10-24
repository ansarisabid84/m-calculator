import React, { useState } from 'react';
import { useTheme } from './Theme.jsx';
import { Segmented } from './Field.jsx';

function Gear() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}

export function SettingsSheet({ onClose }) {
  const { mode, setMode, haptics, setHaptics, fmt, setFmt } = useTheme();
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head"><h3>Settings</h3></div>
        <div className="sheet-body">
          <div className="set-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <div className="t">Appearance</div>
            <Segmented
              options={[{ value: 'auto', label: 'Auto' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]}
              value={mode}
              onChange={setMode}
            />
          </div>
          <div className="seg-block">
            <div className="t">Decimal places</div>
            <Segmented
              options={[{ value: 10, label: 'Auto' }, { value: 2, label: '2' }, { value: 4, label: '4' }, { value: 6, label: '6' }, { value: 8, label: '8' }]}
              value={fmt.decimals}
              onChange={(d) => setFmt({ decimals: d })}
            />
          </div>
          <div className="set-row">
            <div>
              <div className="t">Thousands separator</div>
              <div className="d">Show 1,234,567 instead of 1234567</div>
            </div>
            <button className={'switch' + (fmt.grouping ? ' on' : '')} role="switch" aria-checked={fmt.grouping} aria-label="Thousands separator" onClick={() => setFmt({ grouping: !fmt.grouping })} />
          </div>
          <div className="set-row">
            <div>
              <div className="t">Haptic feedback</div>
              <div className="d">A light tap on every key press</div>
            </div>
            <button className={'switch' + (haptics ? ' on' : '')} role="switch" aria-checked={haptics} aria-label="Haptic feedback" onClick={() => setHaptics(!haptics)} />
          </div>
          <div className="set-row">
            <div>
              <div className="t">Shortcuts</div>
              <div className="d">Tap the result to copy · tap the expression to edit · swipe the display or long-press ⌫ to delete · keyboard works too</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Header({ mode, tick, titleNode, children }) {
  const [settings, setSettings] = useState(false);
  return (
    <div className="topbar">
      {titleNode || (
        <h1>
          <span className="mode">{mode}</span>
          {tick && <span className="tick">{tick}</span>}
        </h1>
      )}
      <div className="actions">
        {children}
        <button className="iconbtn" onClick={() => setSettings(true)} aria-label="Settings">
          <Gear />
        </button>
      </div>
      {settings && <SettingsSheet onClose={() => setSettings(false)} />}
    </div>
  );
}
