import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ColorWheel } from '@/components/color-wheel';
import { ColoringCanvas, type CanvasMode } from '@/components/coloring-canvas';
import { IconButton } from '@/components/icon-button';
import { getDrawing } from '@/drawings';
import { type ColoringState, type Stroke, emptyState, pushUndo } from '@/lib/artwork-state';
import { cacheArtwork, loadArtwork, saveArtwork } from '@/lib/artwork-store';
import { applyClear, applyFill, applyStroke } from '@/lib/coloring-actions';
import { HUES } from '@/lib/palette';

const SAVE_DEBOUNCE_MS = 400;

/**
 * The picture and its undo history are one piece of state, not two. Keeping them
 * together lets every edit be a single pure updater; the earlier shape called
 * `setUndoStack` from inside `setState`'s updater, which is exactly the impurity
 * that makes an edit record its undo entry twice under StrictMode and leaves the
 * first undo tap doing nothing.
 */
type Editor = { art: ColoringState; undo: ColoringState[] };

export default function ColorScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const drawing = useMemo(() => (id ? getDrawing(id) : undefined), [id]);

  const [editor, setEditor] = useState<Editor>({ art: emptyState(), undo: [] });
  const [revision, setRevision] = useState(0);
  const [mode, setMode] = useState<CanvasMode>('brush');
  const [color, setColor] = useState<string>(HUES[0]);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<{ id: string; state: ColoringState } | null>(null);

  // `revision === 0` means the child has not touched this picture yet. Without that
  // guard a slow file read would resolve *after* a first eager tap and overwrite it,
  // and the armed timer would then persist the stale content — the child's first
  // mark disappearing for good.
  useEffect(() => {
    if (!id) return;
    let alive = true;
    loadArtwork(id).then((loaded) => {
      if (alive) setEditor((prev) => (revision === 0 ? { art: loaded, undo: [] } : prev));
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const flush = useCallback(() => {
    const job = pending.current;
    if (!job) return;
    pending.current = null;
    void saveArtwork(job.id, job.state);
  }, []);

  // Cache immediately, write to disk on a delay. The cache is what the gallery reads,
  // so a thumbnail is correct the moment the child navigates back rather than
  // whenever the debounced write happens to land.
  useEffect(() => {
    if (!id || revision === 0) return;
    cacheArtwork(id, editor.art);
    pending.current = { id, state: editor.art };
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, SAVE_DEBOUNCE_MS);
  }, [id, revision, editor.art, flush]);

  // Flush on unmount and on backgrounding — a toddler swiping the app away inside
  // the debounce window would otherwise lose their last stroke.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next !== 'active') flush();
    });
    return () => {
      sub.remove();
      if (timer.current) clearTimeout(timer.current);
      flush();
    };
  }, [flush]);

  const mutate = useCallback((next: (prev: ColoringState) => ColoringState) => {
    setEditor((prev) => ({ art: next(prev.art), undo: pushUndo(prev.undo, prev.art) }));
    setRevision((r) => r + 1);
  }, []);

  const handleFill = useCallback(
    (key: string) => mutate((prev) => applyFill(prev, key, color)),
    [color, mutate],
  );

  const handleStroke = useCallback(
    (stroke: Stroke) => mutate((prev) => applyStroke(prev, stroke)),
    [mutate],
  );

  const handleUndo = useCallback(() => {
    setEditor((prev) =>
      prev.undo.length === 0
        ? prev
        : { art: prev.undo[prev.undo.length - 1], undo: prev.undo.slice(0, -1) },
    );
    setRevision((r) => r + 1);
  }, []);

  // Long-press only, and it records the pre-clear picture, so one undo tap brings
  // a whole drawing back.
  const handleClear = useCallback(() => mutate(applyClear), [mutate]);

  if (!drawing) {
    return <SafeAreaView style={styles.safe} />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.toolbar}>
        <IconButton
          icon="back"
          label="Back to the pictures"
          onPress={() => {
            flush();
            router.back();
          }}
        />
        <IconButton
          icon="brush"
          label="Draw with your finger"
          active={mode === 'brush'}
          onPress={() => setMode('brush')}
          tint={mode === 'brush' ? color : undefined}
        />
        <IconButton
          icon="bucket"
          label="Fill a shape"
          active={mode === 'bucket'}
          onPress={() => setMode('bucket')}
          tint={mode === 'bucket' ? color : undefined}
        />
        <IconButton
          icon="undo"
          label="Undo"
          onPress={editor.undo.length > 0 ? handleUndo : undefined}
        />
        <IconButton icon="trash" label="Press and hold to start over" onLongPress={handleClear} />
      </View>

      <ColoringCanvas
        drawing={drawing}
        state={editor.art}
        mode={mode}
        color={color}
        onFillRegion={handleFill}
        onCommitStroke={handleStroke}
      />

      <View style={styles.wheel}>
        <ColorWheel color={color} onSelect={setColor} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FBF7F0' },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 8,
  },
  wheel: { alignItems: 'center', paddingBottom: 8 },
});
