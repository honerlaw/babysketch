import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { DrawingThumbnail } from '@/components/drawing-thumbnail';
import { DRAWINGS, DRAWING_IDS } from '@/drawings';
import { type ColoringState, emptyState } from '@/lib/artwork-state';
import { loadAllArtwork } from '@/lib/artwork-store';
import { INK } from '@/lib/palette';

const COLUMNS = 3;
const GAP = 10;

export default function GalleryScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [saved, setSaved] = useState<Record<string, ColoringState>>({});

  // One batched read per focus rather than 52 synchronous reads on mount.
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      loadAllArtwork(DRAWING_IDS).then((all) => {
        if (alive) setSaved(all);
      });
      return () => {
        alive = false;
      };
    }, []),
  );

  const cell = Math.floor((width - GAP * (COLUMNS + 1)) / COLUMNS);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <FlatList
        data={DRAWINGS}
        keyExtractor={(d) => d.id}
        numColumns={COLUMNS}
        initialNumToRender={12}
        windowSize={5}
        removeClippedSubviews
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Colour the ${item.id}`}
            onPress={() => router.push(`/color/${item.id}`)}
            style={({ pressed }) => [
              styles.cell,
              { width: cell, height: cell },
              pressed && styles.pressed,
            ]}
          >
            <DrawingThumbnail
              drawing={item}
              state={saved[item.id] ?? emptyState()}
              size={cell - 8}
            />
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FBF7F0' },
  list: { padding: GAP, gap: GAP },
  row: { gap: GAP },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: INK,
  },
  pressed: { opacity: 0.7 },
});
