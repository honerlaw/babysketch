import type { Drawing } from '@/types/drawing';
import { blob, cir, drawing, ell, eye, eyes, f, k, poly, rr, wave } from '@/drawings/build';

/**
 * The six seed subjects. These were chosen to stress the schema before the format
 * froze, not because they were easy: a giraffe for thin appendages, a dolphin over
 * a wave for layered regions, a butterfly for a multi-part silhouette, and three
 * ordinary animals as the baseline.
 */

const cat = drawing('cat', [
  f(rr(72, 50, 11, 30, 5.5)), // tail
  f(ell(50, 66, 24, 19)), // body
  f(rr(35, 78, 11, 16, 5.5)), // front leg
  f(rr(54, 78, 11, 16, 5.5)), // back leg
  f(poly([[35, 26], [39, 9], [50, 22]])), // left ear
  f(poly([[65, 26], [61, 9], [50, 22]])), // right ear
  f(cir(50, 34, 18)), // head
  ...eyes(50, 31, 7),
  k(poly([[50, 38], [46, 42], [54, 42]])), // nose
]);

const elephant = drawing('elephant', [
  f(ell(56, 60, 27, 22)), // body
  f(rr(36, 76, 12, 18, 6)), // front leg
  f(rr(58, 76, 12, 18, 6)), // back leg
  f(ell(78, 52, 12, 13)), // ear
  f(cir(38, 42, 20)), // head
  f(blob([[26, 52], [20, 66], [24, 80], [33, 80], [30, 66], [34, 54]])), // trunk
  f(rr(80, 44, 8, 16, 4)), // tail
  ...eyes(38, 38, 7, 2.4),
]);

const dog = drawing('dog', [
  f(rr(72, 46, 10, 26, 5)), // tail
  f(ell(50, 64, 25, 20)), // body
  f(rr(34, 78, 11, 16, 5.5)), // front leg
  f(rr(55, 78, 11, 16, 5.5)), // back leg
  f(ell(30, 32, 9, 15)), // left ear
  f(ell(70, 32, 9, 15)), // right ear
  f(cir(50, 34, 18)), // head
  f(ell(50, 42, 10, 8)), // muzzle
  ...eyes(50, 29, 7),
  k(cir(50, 39, 3.2)), // nose
]);

// Thin appendages: the long neck and stilt legs are the case the minimum
// region-size floor exists to police.
const giraffe = drawing('giraffe', [
  f(ell(54, 60, 22, 17)), // body
  f(rr(38, 74, 9, 22, 4.5)), // front leg
  f(rr(62, 74, 9, 22, 4.5)), // back leg
  f(rr(70, 40, 8, 22, 4)), // tail side
  f(rr(30, 22, 14, 42, 7)), // neck
  f(ell(30, 18, 13, 11)), // head
  f(cir(63, 55, 7)), // spot
  f(cir(50, 66, 7)), // spot
  ...eyes(30, 15, 5, 2.2),
  k(cir(24, 22, 2)), // nostril
]);

// Layered regions: the dolphin sits in front of the wave, so the wave is authored
// first and the dolphin's fill covers it.
const dolphin = drawing('dolphin', [
  f(wave(76, 6, 96)), // wave
  f(blob([[16, 52], [40, 34], [68, 34], [88, 46], [66, 60], [38, 62]])), // body
  f(poly([[52, 34], [58, 16], [66, 36]])), // dorsal fin
  f(poly([[44, 58], [40, 74], [56, 62]])), // flipper
  f(poly([[86, 44], [98, 30], [96, 52]])), // tail fin
  eye(30, 46, 2.8),
]);

// Multi-part silhouette: four wings plus a body, none of them touching.
const butterfly = drawing('butterfly', [
  f(ell(30, 36, 20, 18)), // upper left wing
  f(ell(70, 36, 20, 18)), // upper right wing
  f(ell(34, 68, 16, 14)), // lower left wing
  f(ell(66, 68, 16, 14)), // lower right wing
  f(rr(45, 26, 10, 52, 5)), // body
  f(cir(50, 20, 8)), // head
  ...eyes(50, 18, 3, 2),
  k(rr(41, 6, 3, 12, 1.5)), // left antenna
  k(rr(56, 6, 3, 12, 1.5)), // right antenna
]);

export const SEED_DRAWINGS: readonly Drawing[] = [
  cat,
  dog,
  elephant,
  giraffe,
  dolphin,
  butterfly,
];
