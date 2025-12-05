// src/components/SubscriptionForm.jsx
import React, { useState } from 'react';
import { currencies } from '../utils/currency';
import { nowISO } from '../utils/date';

export default function SubscriptionForm({ onAdd }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [startDate, setStartDate] = useState(nowISO());
  const [cycle, setCycle] = useState('monthly'); // monthly, yearly, or number of days
  const [notes, setNotes] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!name) return alert('请输入服务名称');
    onAdd({ name, amount: Number(amount), currency, startDate, cycle, notes });
    setName(''); setAmount(0); setNotes('');
  };

  return (
    <form onSubmit={submit} className="card">
      <h3>添加订阅</h3>
      <div><input value={name} onChange={e=>setName(e.target.value)} placeholder="服务名称 (例如 Netflix)" /></div>
      <div>
        <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} step="0.01" />
        <select value={currency} onChange={e=>setCurrency(e.target.value)}>
          {currencies.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label>开始/下次到期: <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} /></label>
      </div>
      <div>
        <label>周期:
          <select value={cycle} onChange={e=>setCycle(e.target.value)}>
            <option value="monthly">每月</option>
            <option value="yearly">每年</option>
            <option value="30">每 30 天</option>
            <option value="custom">输入天数</option>
          </select>
        </label>
        {cycle === 'custom' && <input type="number" placeholder="天数" onChange={(e)=>setCycle(e.target.value)} />}
      </div>
      <div><textarea placeholder="备注" value={notes} onChange={e=>setNotes(e.target.value)} /></div>
      <div><button type="submit">添加</button></div>
    </form>
  );
}
