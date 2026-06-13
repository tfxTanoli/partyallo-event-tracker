import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  EVENTS: 'partyallo_events',
  STATIONS: 'partyallo_stations',
  PURCHASES: 'partyallo_purchases',
  SETTINGS: 'partyallo_settings',
  PACKER: 'partyallo_packer',
  THEME: 'partyallo_theme',
};

export { KEYS };

export async function loadData<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function saveData<T>(key: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch {
    // silently fail — in Milestone 1 we use mock data
  }
}

export async function clearData(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // silently fail
  }
}
