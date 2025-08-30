// mobile/src/lib/storage/async.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getJSON(key, fallback = null) {
  const str = await AsyncStorage.getItem(key);
  if (!str) return fallback;
  try { return JSON.parse(str); } catch { return fallback; }
}

export async function setJSON(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}
