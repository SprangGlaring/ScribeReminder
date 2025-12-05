// src/App.jsx
import React, { useEffect, useState } from 'react';
import { loadSubscriptions, saveSubscriptions, exportJSON, importJSON } from './db';
import SubscriptionForm from './components/SubscriptionForm';
import SubscriptionList from './components/SubscriptionList';
import Analytics from './components/Analytics';
import { nowISO, nextDueDate } from './utils/date';

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission();
  }
}

function notify(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body });
  }
}

export default function App() {
  const [subs, setSubs] = useState([]);
  const [warningDays, setWarningDays] = useState(3);

  useEffect(() => {
    requestNotificationPermission();
    (async () => {
      const list = await loadSubscriptions();
      setSubs(list);
    })();
  }, []);

  useEffect(() => {
    saveSubscriptions(subs);
  }, [subs]);

  // simple in-session reminder check every minute (works while app open)
  useEffect(() => {
    const checkReminders = () => {
      const today = nowISO();
      subs.forEach(s => {
        const next = nextDueDate(s.nextDate || s.startDate, s.cycle, today);
        const daysLeft = (new Date(next) - new Date(today)) / (1000*60*60*24);
        if (daysLeft <= warningDays && !s.notified) {
          notify(`ScribeReminder: ${s.name} 即将到期`, `${s.name} 在 ${next} 到期，费用：${s.amount} ${s.currency}`);
          // mark notified in memory (persist)
          s.notified = true;
        }
      });
      setSubs([...subs]);
    };
    checkReminders();
    const id = setInterval(checkReminders, 60 * 1000);
    return () => clearInterval(id);
  }, [subs, warningDays]);

  const addSub = (s) => {
    const toSave = { id: Date.now().toString(), ...s };
    setSubs(prev => [toSave, ...prev]);
  };

  const updateSub = (id, patch) => {
    setSubs(prev => prev.map(x => x.id === id ? { ...x, ...patch } : x));
  };

  const removeSub = (id) => {
    setSubs(prev => prev.filter(x => x.id !== id));
  };

  const handleExport = async () => {
    const text = await exportJSON();
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'scribe_subscriptions.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (file) => {
    try {
      const text = await file.text();
      await importJSON(text);
      const list = await loadSubscriptions();
      setSubs(list);
      alert('导入成功');
    } catch (e) {
      alert('导入失败: ' + e.message);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>ScribeReminder</h1>
        <p>掌控你的订阅，保护隐私 — 本地优先。</p>
      </header>

      <main>
        <section className="left">
          <SubscriptionForm onAdd={addSub} />
          <div style={{marginTop:12}}>
            <label>到期提醒提前天数: <input type="number" value={warningDays} onChange={e=>setWarningDays(Number(e.target.value))} /></label>
            <div style={{marginTop:8}}>
              <button onClick={handleExport}>导出订阅 (JSON)</button>
              <input type="file" accept="application/json" onChange={e=>handleImport(e.target.files[0])} />
            </div>
          </div>
          <SubscriptionList subs={subs} onUpdate={updateSub} onRemove={removeSub} />
        </section>

        <aside className="right">
          <Analytics subs={subs} />
        </aside>
      </main>

      <footer>
        <small>完全开源 · 注重隐私 · 社区驱动</small>
      </footer>
    </div>
  );
}
