import React from 'react';

const ICONS = {
  calc: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="2.5" />
      <line x1="8" y1="7" x2="16" y2="7" />
      <line x1="8" y1="12" x2="8" y2="12" /><line x1="12" y1="12" x2="12" y2="12" /><line x1="16" y1="12" x2="16" y2="12" />
      <line x1="8" y1="16" x2="8" y2="16" /><line x1="12" y1="16" x2="12" y2="16" /><line x1="16" y1="16" x2="16" y2="16" />
    </svg>
  ),
  sci: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 5h14" /><path d="M9 5l5 14" /><path d="M15 5l-5 14" /><path d="M5 19h14" />
    </svg>
  ),
  convert: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8h13l-3-3" /><path d="M20 16H7l3 3" />
    </svg>
  ),
  health: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h4l2-5 3 9 2-6 2 2h5" />
    </svg>
  ),
  tools: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 5.5a3.5 3.5 0 0 0-4.9 4.4L4 15.5 8.5 20l5.6-5.6a3.5 3.5 0 0 0 4.4-4.9l-2.3 2.3-2-2 2.3-2.3z" />
    </svg>
  ),
};

const TABS = [
  { id: 'calc', label: 'Calc' },
  { id: 'convert', label: 'Convert' },
  { id: 'health', label: 'Health' },
  { id: 'tools', label: 'Tools' },
];

export default function TabBar({ active, onChange }) {
  return (
    <nav className="tabbar">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={'tab' + (active === t.id ? ' active' : '')}
          onClick={() => onChange(t.id)}
          aria-label={t.label}
          aria-current={active === t.id ? 'page' : undefined}
        >
          {ICONS[t.id]}
          <span className="label">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
