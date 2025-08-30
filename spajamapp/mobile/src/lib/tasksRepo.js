// src/lib/tasksRepo.js
import { getJSON, setJSON } from './storage/async';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const KEY = 'tasks';

export async function listTasks() {
  return await getJSON(KEY, []);
}

export async function addTask({ text, type, severity }) {
  const t = (text ?? '').trim();
  if (!t) throw new Error('text is empty');
  const now = new Date().toISOString();
  const item = {
    id: uuidv4(),
    text: t,
    type,                 // '仕事' or '遊び'
    severity,             // 1..4
    createdAt: now,
    updatedAt: now,
  };
  const list = await listTasks();
  list.unshift(item);
  await setJSON(KEY, list);
  return item;
}

export async function updateTask(id, patch) {
  // 受け付ける項目だけを反映（done は廃止）
  const { text, type, severity } = patch ?? {};
  const now = new Date().toISOString();
  const list = await listTasks();
  const next = list.map((it) =>
    it.id === id
      ? {
          ...it,
          ...(text !== undefined ? { text: (text ?? '').trim() } : {}),
          ...(type !== undefined ? { type } : {}),
          ...(severity !== undefined ? { severity } : {}),
          updatedAt: now,
        }
      : it
  );
  await setJSON(KEY, next);
}

export async function removeTask(id) {
  const list = await listTasks();
  await setJSON(KEY, list.filter((it) => it.id !== id));
}

export async function clearAllTasks() {
  await setJSON(KEY, []);
}
