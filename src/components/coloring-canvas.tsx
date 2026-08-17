import { useCallback, useId, useMemo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';

import type { Drawing } from '@/types/drawing';
import { type ColoringState, type Stroke, shapeKey, strokeToPath } from '@/lib/artwork-state';
import { INK, PAPER } from '@/lib/palette';

/** Points closer than this in viewBox units are dropped — invisible, but much less data. */
const MIN_POINT_GAP = 1.2;
const OUTLINE_WIDTH = 1.6;
export const BRUSH_WIDTH = 7;

export type CanvasMode = 'brush' | 'bucket';

type Props = {
  drawing: Drawing;
  state: ColoringState;
  mode: CanvasMode;
  color: string;
  onFillRegion: (key: string) => void;
  onCommitStroke: (stroke: Stroke) => void;
};

export function ColoringCanvas({
  drawing,
  state,
  mode,
  color,
  onFillRegion,
  onCommitStroke,
}: Props) {
  const clipId = `art-${useId().replace(/[^a-zA-Z0-9]/g, '')}-${drawing.id}`;
  const [size, setSize] = useState(0);
  const [live, setLive] = useState<number[]>([]);
  const [vw, vh] = drawing.viewBox;

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize(Math.min(width, height));
  };

  // The in-progress stroke lives in state rather than a ref so nothing reads
  // mutable data during render; the finished stroke is committed from an effect.
  const addPoint = useCallback(
    (x: number, y: number) => {
      if (size <= 0) return;
      const vx = (x / size) * vw;
      const vy = (y / size) * vh;
      setLive((prev) => {
        const len = prev.length;
        if (len >= 2 && Math.hypot(vx - prev[len - 2], vy - prev[len - 1]) < MIN_POINT_GAP) {
          return prev;
        }
        return [...prev, vx, vy];
      });
    },
    [size, vw, vh],
  );

  // Rebuilt each render rather than memoised, so `onFinalize` closes over the
  // current point list; every added point re-renders anyway. Disabled in bucket
  // mode so taps reach the SVG regions underneath instead of being swallowed by
  // the pan recogniser.
  const pan = Gesture.Pan()
    .enabled(mode === 'brush')
    .minDistance(0)
    .runOnJS(true)
    .onBegin((e) => {
      setLive([]);
      addPoint(e.x, e.y);
    })
    .onUpdate((e) => addPoint(e.x, e.y))
    .onFinalize(() => {
      if (live.length >= 2) onCommitStroke({ c: color, w: BRUSH_WIDTH, p: live });
      setLive([]);
    });

  const fillable = useMemo(
    () => drawing.shapes.map((s, i) => ({ s, i })).filter(({ s }) => s.fillable),
    [drawing],
  );

  const liveStroke = live.length >= 2 ? strokeToPath({ c: color, w: BRUSH_WIDTH, p: live }) : '';

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      <GestureDetector gesture={pan}>
        <View style={[styles.square, { width: size, height: size }]}>
          {size > 0 && (
            <Svg width={size} height={size} viewBox={`0 0 ${vw} ${vh}`}>
              <Defs>
                <ClipPath id={clipId}>
                  {fillable.map(({ s, i }) => (
                    <Path key={`c${i}`} d={s.d} />
                  ))}
                </ClipPath>
              </Defs>

              <Rect x={0} y={0} width={vw} height={vh} fill={PAPER} />

              {/* Fill layer — one tappable region per colourable shape. */}
              {fillable.map(({ s, i }) => (
                <Path
                  key={`f${i}`}
                  d={s.d}
                  fill={state.fills[shapeKey(s.d)] ?? PAPER}
                  onPress={mode === 'bucket' ? () => onFillRegion(shapeKey(s.d)) : undefined}
                />
              ))}

              {/* Freehand layer — clipped to the subject so paint never reaches the background. */}
              <G clipPath={`url(#${clipId})`}>
                {state.strokes.map((stroke, i) => (
                  <Path
                    key={`s${i}`}
                    d={strokeToPath(stroke)}
                    stroke={stroke.c}
                    strokeWidth={stroke.w}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                ))}
                {liveStroke !== '' && (
                  <Path
                    d={liveStroke}
                    stroke={color}
                    strokeWidth={BRUSH_WIDTH}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                )}
              </G>

              {/* Outline layer — drawn last, so the line art survives any amount of paint. */}
              {drawing.shapes.map((s, i) =>
                s.ink ? null : (
                  <Path
                    key={`o${i}`}
                    d={s.d}
                    fill="none"
                    stroke={INK}
                    strokeWidth={OUTLINE_WIDTH}
                    strokeLinejoin="round"
                  />
                ),
              )}
              {drawing.shapes.map((s, i) =>
                s.ink ? <Path key={`k${i}`} d={s.d} fill={INK} /> : null,
              )}
            </Svg>
          )}
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' },
  square: { alignItems: 'center', justifyContent: 'center' },
});
