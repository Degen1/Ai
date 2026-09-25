import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

import type { ChatMessage } from './chat-data';

export type SelectedPhoto = {
  id: string;
  uri: string;
  base64: string;
};

// Keep recently selected JPEGs available for the first send without reading them back
// through the native file bridge. The saved file remains the source after a restart.
const recentImageData = new Map<string, string>();

function cacheImage(uri: string, dataUrl: string) {
  recentImageData.set(uri, dataUrl);
  if (recentImageData.size > 4) {
    const oldest = recentImageData.keys().next().value;
    if (oldest) recentImageData.delete(oldest);
  }
}

export function saveSelectedPhotos(photos: SelectedPhoto[]): NonNullable<ChatMessage['images']> {
  if (Platform.OS === 'web') {
    return photos.map(({ id, base64 }) => ({ id, uri: `data:image/jpeg;base64,${base64}` }));
  }

  const directory = new Directory(Paths.document, 'chat-images');
  directory.create({ idempotent: true });
  return photos.map(({ id, base64 }) => {
    const file = new File(directory, `${id}.jpg`);
    file.create({ overwrite: true });
    file.write(base64, { encoding: 'base64' });
    cacheImage(file.uri, `data:image/jpeg;base64,${base64}`);
    return { id, uri: file.uri };
  });
}

export async function imageDataUrl(uri: string): Promise<string> {
  if (uri.startsWith('data:image/jpeg;base64,')) return uri;
  const cached = recentImageData.get(uri);
  if (cached) return cached;
  try {
    return `data:image/jpeg;base64,${await new File(uri).base64()}`;
  } catch {
    throw new Error('PHOTO_READ_FAILED');
  }
}
