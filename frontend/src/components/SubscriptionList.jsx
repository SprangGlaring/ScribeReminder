// src/components/SubscriptionList.jsx
import React from 'react';
import { formatAmount } from '../utils/currency';
import { nextDueDate } from '../utils/date';

export default function SubscriptionList({ subs, onUpdate, onRemove }) {
  return (
    <div className="card">
      <h3>订阅列表</h3>
      {subs.length === 0 && <div>当前没有订阅，快添加一个吧。</div>}
      <ul>
        {subs.map(s => {
          const next = nextDueDate(s.nextDate || s.startDate, s.cycle);
          return (
            <li key={s.id} className="sub-item">
              <div className="left">
                <strong>{s.name}</strong>
                <div>{formatAmount(s.amount, s.currency)} · 周期: {s.cycle}</div>
                <div>下次到期: {next}</div>
              </div>
              <div className="right">
                <button onClick={() => onUpdate(s.id, { nextDate: next })}>标记为已续费</button>
                <button onClick={() => onRemove(s.id)}>删除</button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
