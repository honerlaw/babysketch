import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { INK } from '@/lib/palette';

export const TOUCH_SIZE = 60;

/** Wordless glyphs. The app shows a toddler pictures, never labels. */
export const ICONS = {
  brush:
    'M20 44 L34 30 L42 38 L28 52 Z M34 30 L44 12 L52 20 L42 38 Z M20 44 L16 56 L28 52 Z',
  bucket:
    'M18 30 L34 14 L52 32 L36 48 Z M50 40 C50 40 58 48 58 52 C58 56 54 58 50 58 C46 58 42 56 42 52 C42 48 50 40 50 40 Z',
  undo:
    'M32 18 A18 18 0 1 1 14 36 L22 36 A10 10 0 1 0 32 26 L32 34 L18 22 L32 10 Z',
  trash:
    'M22 24 L50 24 L47 56 L25 56 Z M28 18 L44 18 L44 24 L28 24 Z M31 30 L31 50 M40 30 L40 50',
  back: 'M42 14 L22 34 L42 54 L48 48 L34 34 L48 20 Z',
} as const;

type Props = {
  icon: keyof typeof ICONS;
  label: string;
  onPress?: () => void;
  onLongPress?: () => void;
  active?: boolean;
  tint?: string;
};

export function IconButton({ icon, label, onPress, onLongPress, active, tint }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={600}
      style={({ pressed }) => [
        styles.button,
        active && styles.active,
        pressed && styles.pressed,
      ]}
    >
      <View pointerEvents="none">
        <Svg width={40} height={40} viewBox="0 0 68 68">
          <Path
            d={ICONS[icon]}
            fill={icon === 'trash' ? 'none' : (tint ?? INK)}
            stroke={tint ?? INK}
            strokeWidth={icon === 'trash' ? 4 : 2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </Svg>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: TOUCH_SIZE,
    height: TOUCH_SIZE,
    borderRadius: TOUCH_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1EDE6',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  active: { backgroundColor: '#FFE7A8', borderColor: INK },
  pressed: { opacity: 0.6 },
});
