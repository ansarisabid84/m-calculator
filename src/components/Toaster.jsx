import React, { useEffect, useState } from 'react';

export default function Toaster() {
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    let t;
    const on = (e) => {
      setMsg({ text: e.detail, id: Date.now() });
      clearTimeout(t);
      t = setTimeout(() => setMsg(null), 1500);
    };
    window.addEventListener('app-toast', on);
    return () => { window.removeEventListener('app-toast', on); clearTimeout(t); };
  }, []);
  return msg ? <div className="toast" key={msg.id} role="status">{msg.text}</div> : null;
}
