import { Directory, File, Paths } from 'expo-file-system';

import { type ColoringState, deserialize, emptyState, serialize } from '@/lib/artwork-state';

const DIR_NAME = 'artwork';

/**
 * Write-through cache of what each drawing currently looks like. It exists because
 * the gallery re-reads on focus while the canvas is still finishing its debounced
 * write: react-native-screens keeps the popped screen mounted through its pop
 * animation, so a child who colours a region and immediately taps back could
 * otherwise see the gallery read the file before the write landed, leaving a stale
 * thumbnail until the next focus. Reading memory first removes the race rather
 * than trying to win it.
 */
const cache = new Map<string, ColoringState>();

/** Record the latest state immediately, ahead of the debounced disk write. */
export function cacheArtwork(id: string, state: ColoringState): void {
  cache.set(id, state);
}

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
  const cached = cache.get(id);
  if (cached) return cached;
  try {
    const file = fileFor(id);
    if (!file.exists) return emptyState();
    const state = deserialize(await file.text());
    cache.set(id, state);
    return state;
  } catch (error) {
    console.warn(`[babysketch] could not read artwork "${id}"`, error);
    return emptyState();
  }
}

/**
 * Returns whether the write landed. Failing quietly would mean a child's colouring
 * could vanish — disk full, permission denied, storage evicted — with nothing
 * anywhere recording that it happened. The app still must not crash on a failed
 * autosave, so this reports rather than throws, and the cache keeps the picture
 * correct for this session either way.
 */
export async function saveArtwork(id: string, state: ColoringState): Promise<boolean> {
  cache.set(id, state);
  try {
    const file = fileFor(id);
    file.create({ overwrite: true, intermediates: true });
    file.write(serialize(state));
    return true;
  } catch (error) {
    console.warn(`[babysketch] could not save artwork "${id}"`, error);
    return false;
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
  cache.set(id, emptyState());
  try {
    const file = fileFor(id);
    if (file.exists) file.delete();
  } catch (error) {
    console.warn(`[babysketch] could not clear artwork "${id}"`, error);
  }
}
