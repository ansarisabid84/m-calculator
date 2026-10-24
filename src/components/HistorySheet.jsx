import React from 'react';
import { formatResult } from '../lib/format.js';
import { copyText } from '../lib/native.js';

export default function HistorySheet({ history, onClose, onPickResult, onPickExpr }) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h3>History</h3>
          {history.items.length > 0 && <button className="clear" onClick={history.clear}>Clear all</button>}
        </div>
        <div className="sheet-body history">
          {history.items.length === 0 ? (
            <div className="empty">No calculations yet.<br />Your recent results will appear here.</div>
          ) : (
            history.items.map((h, i) => (
              <div key={h.at + '-' + i} className="h-row">
                <button className="h-item" onClick={() => onPickResult(h.result)} aria-label={`Use result ${formatResult(h.result)}`}>
                  <span className="h-expr">{h.expr}</span>
                  <span className="h-res">{formatResult(h.result)}</span>
                </button>
                <div className="h-actions">
                  <button className="mini" onClick={() => onPickExpr(h.expr)}>Edit</button>
                  <button className="mini" onClick={() => copyText(String(h.result), 'Result copied')}>Copy</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function HistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 4v4h4" /><path d="M12 8v4l3 2" />
    </svg>
  );
}
