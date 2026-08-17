import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ColorWheel } from '@/components/color-wheel';
import { ColoringCanvas, type CanvasMode } from '@/components/coloring-canvas';
import { IconButton } from '@/components/icon-button';
import { getDrawing } from '@/drawings';
import {
  type ColoringState,
  type Stroke,
  clampStrokes,
  emptyState,
  pushUndo,
} from '@/lib/artwork-state';
import { loadArtwork, saveArtwork } from '@/lib/artwork-store';
import { HUES } from '@/lib/palette';

const SAVE_DEBOUNCE_MS = 400;

export default function ColorScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const drawing = useMemo(() => (id ? getDrawing(id) : undefined), [id]);

  const [state, setState] = useState<ColoringState>(emptyState);
  const [undoStack, setUndoStack] = useState<ColoringState[]>([]);
  const [mode, setMode] = useState<CanvasMode>('brush');
  const [color, setColor] = useState<string>(HUES[0]);

  const latest = useRef(state);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirty = useRef(false);

  useEffect(() => {
    latest.current = state;
  }, [state]);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    loadArtwork(id).then((loaded) => {
      if (alive) setState(loaded);
    });
    return () => {
      alive = false;
    };
  }, [id]);

  const flush = useCallback(() => {
    if (!id || !dirty.current) return;
    dirty.current = false;
    void saveArtwork(id, latest.current);
  }, [id]);

  const scheduleSave = useCallback(() => {
    dirty.current = true;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, SAVE_DEBOUNCE_MS);
  }, [flush]);

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
    setState((prev) => {
      setUndoStack((stack) => pushUndo(stack, prev));
      return next(prev);
    });
  }, []);

  const handleFill = useCallback(
    (shapeIndex: number) => {
      mutate((prev) => ({ ...prev, fills: { ...prev.fills, [String(shapeIndex)]: color } }));
      scheduleSave();
    },
    [color, mutate, scheduleSave],
  );

  const handleStroke = useCallback(
    (stroke: Stroke) => {
      mutate((prev) => ({ ...prev, strokes: clampStrokes([...prev.strokes, stroke]) }));
      scheduleSave();
    },
    [mutate, scheduleSave],
  );

  const handleUndo = useCallback(() => {
    setUndoStack((stack) => {
      if (stack.length === 0) return stack;
      setState(stack[stack.length - 1]);
      return stack.slice(0, -1);
    });
    scheduleSave();
  }, [scheduleSave]);

  // Long-press only, and it pushes the pre-clear state so one undo brings it back.
  const handleClear = useCallback(() => {
    mutate(() => emptyState());
    scheduleSave();
  }, [mutate, scheduleSave]);

  if (!drawing) {
    return <SafeAreaView style={styles.safe} />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.toolbar}>
        <IconButton icon="back" label="Back to the pictures" onPress={() => router.back()} />
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
          onPress={undoStack.length > 0 ? handleUndo : undefined}
        />
        <IconButton icon="trash" label="Press and hold to start over" onLongPress={handleClear} />
      </View>

      <ColoringCanvas
        drawing={drawing}
        state={state}
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
