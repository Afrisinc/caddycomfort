import { create } from 'zustand';
import { settingsApi } from '@/lib/api';
import { DEFAULT_STORE_SETTINGS, type StoreSettings } from '@/lib/storeSettings';

interface SettingsStore {
  settings: StoreSettings;
  loaded: boolean;
  load: () => Promise<void>;
  setSettings: (settings: StoreSettings) => void;
}

export const useSettingsStore = create<SettingsStore>()((set, get) => ({
  settings: DEFAULT_STORE_SETTINGS,
  loaded: false,
  load: async () => {
    if (get().loaded) return;
    try {
      set({ settings: await settingsApi.get(), loaded: true });
    } catch {
      set({ loaded: true });
    }
  },
  setSettings: (settings) => set({ settings, loaded: true }),
}));

export const useStoreSettings = () => useSettingsStore((state) => state.settings);
