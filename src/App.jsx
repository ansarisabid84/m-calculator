import React, { useState, useEffect } from 'react';
import TabBar from './components/TabBar.jsx';
import { ThemeProvider } from './components/Theme.jsx';
import Toaster from './components/Toaster.jsx';
import { useHistory } from './lib/history.js';
import { useMemory } from './lib/memory.js';
import { hideSplash } from './lib/native.js';
import Calc from './screens/Calc.jsx';
import Convert from './screens/Convert.jsx';
import Health from './screens/Health.jsx';
import Tools from './screens/Tools.jsx';

export default function App() {
  const [tab, setTab] = useState('calc');
  const history = useHistory();
  const mem = useMemory();

  useEffect(() => { hideSplash(); }, []);

  return (
    <ThemeProvider>
      <div className="aurora" aria-hidden="true"><i /><i /><i /></div>
      <div className="app">
        {tab === 'calc' && <Calc history={history} mem={mem} />}
        {tab === 'convert' && <Convert />}
        {tab === 'health' && <Health />}
        {tab === 'tools' && <Tools currency="₹" />}
        <TabBar active={tab} onChange={setTab} />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
