import { useId } from 'react';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';

import type { Drawing } from '@/types/drawing';
import { type ColoringState, strokeToPath } from '@/lib/artwork-state';
import { INK, PAPER } from '@/lib/palette';

type Props = {
  drawing: Drawing;
  state: ColoringState;
  size: number;
};

/**
 * Renders all three layers, freehand included. Skipping strokes here would be
 * cheaper, but a picture coloured only by dragging would then look untouched in
 * the gallery forever.
 */
export function DrawingThumbnail({ drawing, state, size }: Props) {
  const clipId = `thumb-${useId().replace(/[^a-zA-Z0-9]/g, '')}-${drawing.id}`;
  const [vw, vh] = drawing.viewBox;
  const fillable = drawing.shapes.map((s, i) => ({ s, i })).filter(({ s }) => s.fillable);

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${vw} ${vh}`}>
      <Defs>
        <ClipPath id={clipId}>
          {fillable.map(({ s, i }) => (
            <Path key={`c${i}`} d={s.d} />
          ))}
        </ClipPath>
      </Defs>
      <Rect x={0} y={0} width={vw} height={vh} fill={PAPER} />
      {fillable.map(({ s, i }) => (
        <Path key={`f${i}`} d={s.d} fill={state.fills[String(i)] ?? PAPER} />
      ))}
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
      </G>
      {drawing.shapes.map((s, i) =>
        s.ink ? null : (
          <Path key={`o${i}`} d={s.d} fill="none" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
        ),
      )}
      {drawing.shapes.map((s, i) => (s.ink ? <Path key={`k${i}`} d={s.d} fill={INK} /> : null))}
    </Svg>
  );
}
