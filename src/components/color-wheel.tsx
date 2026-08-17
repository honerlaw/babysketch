import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Circle, Path } from 'react-native-svg';

import { INK } from '@/lib/palette';
import {
  SWATCH_D,
  WHEEL_CENTER_R,
  WHEEL_OUTER_R,
  WHEEL_SIZE,
  sectorAt,
  sectorPath,
  swatchColors,
  wheelColors,
} from '@/lib/wheel';

type Props = {
  color: string;
  onSelect: (color: string) => void;
};

/**
 * Colour selection with no words anywhere: a ring of hues you can tap or drag
 * around, a centre disc previewing the current colour, and a row of neutrals.
 */
export function ColorWheel({ color, onSelect }: Props) {
  const hues = wheelColors();
  const neutrals = swatchColors();
  const c = WHEEL_OUTER_R;

  // One recogniser handles both gestures: `onBegin` fires on the first touch, so a
  // tap selects, and `onUpdate` keeps selecting as the finger sweeps, which is the
  // "scroll through the colours" gesture. The sectors deliberately carry no
  // `onPress` of their own — the pan claims the touch first, so a second handler
  // would be dead code that only misleads the next reader.
  const scrub = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .runOnJS(true)
        .onBegin((e) => {
          const idx = sectorAt(e.x - c, e.y - c);
          if (idx !== null) onSelect(hues[idx]);
        })
        .onUpdate((e) => {
          const idx = sectorAt(e.x - c, e.y - c);
          if (idx !== null) onSelect(hues[idx]);
        }),
    [c, hues, onSelect],
  );

  return (
    <View style={styles.wrap}>
      <GestureDetector gesture={scrub}>
        <View style={styles.wheel}>
          <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
            {hues.map((hue, i) => (
              <Path
                key={hue}
                d={sectorPath(i, c, c)}
                fill={hue}
                stroke={hue === color ? INK : '#FFFFFF'}
                strokeWidth={hue === color ? 4 : 2}
              />
            ))}
            <Circle cx={c} cy={c} r={WHEEL_CENTER_R} fill={color} stroke={INK} strokeWidth={3} />
          </Svg>
        </View>
      </GestureDetector>

      <View style={styles.swatches}>
        {neutrals.map((n) => (
          <Pressable
            key={n}
            accessibilityRole="button"
            accessibilityLabel={`Select colour ${n}`}
            onPress={() => onSelect(n)}
            style={[
              styles.swatch,
              { backgroundColor: n, borderWidth: n === color ? 4 : 2 },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  wheel: { width: WHEEL_SIZE, height: WHEEL_SIZE },
  swatches: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  swatch: {
    width: SWATCH_D,
    height: SWATCH_D,
    borderRadius: SWATCH_D / 2,
    borderColor: INK,
  },
});
