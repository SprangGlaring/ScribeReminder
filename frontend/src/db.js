// src/db.js
import { get, set } from 'idb-keyval';

const KEY = 'scribe:subscriptions';

export async function loadSubscriptions() {
  const v = await get(KEY);
  return Array.isArray(v) ? v : [];
}

export async function saveSubscriptions(list) {
  await set(KEY, list || []);
}

export async function exportJSON() {
  const list = await loadSubscriptions();
  return JSON.stringify(list, null, 2);
}

export async function importJSON(jsonText) {
  const arr = JSON.parse(jsonText);
  if (!Array.isArray(arr)) throw new Error('Invalid import format');
  await saveSubscriptions(arr);
  return arr;
}
