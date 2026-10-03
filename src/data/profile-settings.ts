import { File, Paths } from 'expo-file-system';
import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

export type ThemePreference = 'system' | 'light' | 'dark';

type ProfileSettings = {
  profiles: Record<string, AccountProfile>;
  theme: ThemePreference;
};

type AccountProfile = {
  avatar: string | null;
  displayName: string | null;
};

const storageName = 'sara-profile-v1';
const emptyProfile: AccountProfile = { avatar: null, displayName: null };
const defaultSettings: ProfileSettings = { profiles: {}, theme: 'system' };
const listeners = new Set<() => void>();

function readSettings(): ProfileSettings {
  try {
    const stored = Platform.OS === 'web'
      ? (typeof window === 'undefined' ? null : window.localStorage.getItem(storageName))
      : (() => {
          const file = new File(Paths.document, `${storageName}.json`);
          return file.exists ? file.textSync() : null;
        })();
    if (!stored) return defaultSettings;
    const value: unknown = JSON.parse(stored);
    if (!value || typeof value !== 'object') return defaultSettings;
    const data = value as Partial<ProfileSettings>;
    const profiles: Record<string, AccountProfile> = {};
    if (data.profiles && typeof data.profiles === 'object') {
      for (const [userId, profile] of Object.entries(data.profiles)) {
        if (!profile || typeof profile !== 'object') continue;
        profiles[userId] = {
          avatar: typeof profile.avatar === 'string' ? profile.avatar : null,
          displayName: typeof profile.displayName === 'string' ? profile.displayName : null,
        };
      }
    }
    return {
      profiles,
      theme: data.theme === 'light' || data.theme === 'dark' ? data.theme : 'system',
    };
  } catch {
    return defaultSettings;
  }
}

let settings = readSettings();

function saveSettings(next: ProfileSettings) {
  const serialized = JSON.stringify(next);
  if (Platform.OS === 'web') {
    window.localStorage.setItem(storageName, serialized);
  } else {
    const temporary = new File(Paths.document, `${storageName}.tmp`);
    temporary.create({ overwrite: true });
    temporary.write(serialized);
    temporary.moveSync(new File(Paths.document, `${storageName}.json`), { overwrite: true });
  }
  settings = next;
  listeners.forEach((listener) => listener());
}

export function useProfileSettings() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    () => settings,
    () => defaultSettings,
  );
}

export function useAccountProfile(userId: string | null) {
  const { profiles } = useProfileSettings();
  return userId ? profiles[userId] ?? emptyProfile : emptyProfile;
}

export function setThemePreference(theme: ThemePreference) {
  saveSettings({ ...settings, theme });
}

export function setProfileDisplayName(userId: string, displayName: string) {
  saveSettings({
    ...settings,
    profiles: {
      ...settings.profiles,
      [userId]: {
        ...(settings.profiles[userId] ?? emptyProfile),
        displayName: displayName.trim().slice(0, 40) || null,
      },
    },
  });
}

export function saveProfileAvatar(userId: string, base64: string) {
  const previous = settings.profiles[userId]?.avatar;
  if (Platform.OS === 'web') {
    saveSettings({
      ...settings,
      profiles: {
        ...settings.profiles,
        [userId]: {
          ...(settings.profiles[userId] ?? emptyProfile),
          avatar: `data:image/jpeg;base64,${base64}`,
        },
      },
    });
    return;
  }

  const file = new File(Paths.document, `sara-avatar-${Date.now()}.jpg`);
  file.create();
  file.write(base64, { encoding: 'base64' });
  try {
    saveSettings({
      ...settings,
      profiles: {
        ...settings.profiles,
        [userId]: { ...(settings.profiles[userId] ?? emptyProfile), avatar: file.uri },
      },
    });
  } catch (error) {
    file.delete();
    throw error;
  }
  if (previous?.startsWith(Paths.document.uri)) {
    try { new File(previous).delete(); } catch { /* Keep the new avatar if cleanup fails. */ }
  }
}

export function removeProfileAvatar(userId: string) {
  const previous = settings.profiles[userId]?.avatar;
  if (!previous) return;
  saveSettings({
    ...settings,
    profiles: {
      ...settings.profiles,
      [userId]: { ...(settings.profiles[userId] ?? emptyProfile), avatar: null },
    },
  });
  if (Platform.OS !== 'web' && previous.startsWith(Paths.document.uri)) {
    try { new File(previous).delete(); } catch { /* The saved profile no longer references this file. */ }
  }
}

export function clearAccountProfile(userId: string) {
  const previous = settings.profiles[userId]?.avatar;
  const profiles = { ...settings.profiles };
  delete profiles[userId];
  saveSettings({ ...settings, profiles });
  if (previous?.startsWith(Paths.document.uri)) {
    try { new File(previous).delete(); } catch { /* Account is already removed. */ }
  }
}
