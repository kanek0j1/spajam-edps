// src/lib/tasksRepo.js
import { getJSON, setJSON } from './storage/async';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const KEY = 'tasks';

/** すべて取得（なければ []） */
export async function listTasks() {
  return await getJSON(KEY, []);
}

/** 1件追加（先頭に追加） */
export async function addTask({ text, type, severity }) {
  const t = (text ?? '').trim();
  if (!t) throw new Error('text is empty');
  const now = new Date().toISOString();
  const item = {
    id: uuidv4(),
    text: t,
    type,                 // '仕事' or '遊び'
    severity,             // 1..4
    done: false,
    createdAt: now,
    updatedAt: now,
  };
  const list = await listTasks();
  list.unshift(item);
  await setJSON(KEY, list);
  return item;
}

/** 一部更新（存在しない id は無視） */
export async function updateTask(id, patch) {
  const now = new Date().toISOString();
  const list = await listTasks();
  const next = list.map((it) =>
    it.id === id ? { ...it, ...patch, updatedAt: now } : it
  );
  await setJSON(KEY, next);
}

/** 完了トグル */
export async function toggleTask(id) {
  const now = new Date().toISOString();
  const list = await listTasks();
  const next = list.map((it) =>
    it.id === id ? { ...it, done: !it.done, updatedAt: now } : it
  );
  await setJSON(KEY, next);
}

/** 1件削除 */
export async function removeTask(id) {
  const list = await listTasks();
  const next = list.filter((it) => it.id !== id);
  await setJSON(KEY, next);
}

/** 全削除（空配列で上書き） */
export async function clearAllTasks() {
  await setJSON(KEY, []);
}
