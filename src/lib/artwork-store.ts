import { Directory, File, Paths } from 'expo-file-system';

import { type ColoringState, deserialize, emptyState, serialize } from '@/lib/artwork-state';

const DIR_NAME = 'artwork';

const artworkDir = () => new Directory(Paths.document, DIR_NAME);

function ensureDir(): Directory {
  const dir = artworkDir();
  try {
    if (!dir.exists) dir.create({ intermediates: true });
  } catch {
    // A create race with another write is harmless — the directory is what matters.
  }
  return dir;
}

const fileFor = (id: string) => new File(ensureDir(), `${id}.json`);

export async function loadArtwork(id: string): Promise<ColoringState> {
  try {
    const file = fileFor(id);
    if (!file.exists) return emptyState();
    return deserialize(await file.text());
  } catch {
    return emptyState();
  }
}

export async function saveArtwork(id: string, state: ColoringState): Promise<void> {
  try {
    const file = fileFor(id);
    file.create({ overwrite: true, intermediates: true });
    file.write(serialize(state));
  } catch {
    // Losing one autosave is survivable; taking the canvas down with it is not.
  }
}

/** One batched pass for the gallery, rather than 52 synchronous reads on mount. */
export async function loadAllArtwork(ids: readonly string[]): Promise<Record<string, ColoringState>> {
  const entries = await Promise.all(
    ids.map(async (id) => [id, await loadArtwork(id)] as const),
  );
  const out: Record<string, ColoringState> = {};
  for (const [id, state] of entries) out[id] = state;
  return out;
}

export async function clearArtwork(id: string): Promise<void> {
  try {
    const file = fileFor(id);
    if (file.exists) file.delete();
  } catch {
    // Nothing to recover — the caller has already reset in-memory state.
  }
}
