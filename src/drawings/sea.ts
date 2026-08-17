import type { Drawing } from '@/types/drawing';
import { blob, cir, drawing, ell, eye, eyes, f, k, poly, rr, star } from '@/drawings/build';

/** Sea creatures. Same authoring discipline as the land set: decoration last. */

const fish = drawing('fish', [
  f(ell(46, 50, 28, 18)),
  f(poly([[72, 50], [92, 34], [92, 66]])),
  f(poly([[40, 32], [50, 18], [58, 32]])),
  f(poly([[40, 68], [50, 82], [58, 68]])),
  f(cir(28, 50, 9)),
  eye(24, 46, 2.8),
]);

const whale = drawing('whale', [
  f(blob([[10, 52], [34, 34], [64, 34], [86, 48], [64, 68], [30, 68]])),
  f(poly([[82, 46], [98, 32], [96, 62]])),
  f(poly([[26, 66], [38, 80], [52, 68]])),
  f(rr(44, 12, 10, 22, 5)),
  f(ell(48, 8, 14, 7)),
  eye(26, 48, 2.8),
]);

const octopus = drawing('octopus', [
  f(ell(50, 40, 26, 22)),
  f(rr(18, 58, 9, 30, 4.5)),
  f(rr(32, 60, 9, 32, 4.5)),
  f(rr(46, 62, 9, 32, 4.5)),
  f(rr(60, 60, 9, 32, 4.5)),
  f(rr(74, 58, 9, 30, 4.5)),
  ...eyes(50, 36, 10, 3.4),
]);

const crab = drawing('crab', [
  f(ell(50, 56, 28, 20)),
  f(ell(14, 40, 12, 9)),
  f(ell(86, 40, 12, 9)),
  f(rr(22, 74, 8, 18, 4)),
  f(rr(46, 76, 8, 18, 4)),
  f(rr(70, 74, 8, 18, 4)),
  ...eyes(50, 44, 10, 3.2),
  k(rr(40, 62, 20, 3, 1.5)),
]);

const turtle = drawing('turtle', [
  f(ell(50, 54, 30, 22)),
  f(cir(84, 54, 10)),
  f(rr(18, 70, 14, 9, 4.5)),
  f(rr(64, 70, 14, 9, 4.5)),
  f(cir(50, 54, 12)),
  f(cir(32, 46, 7)),
  f(cir(68, 46, 7)),
  eye(88, 51, 2.4),
]);

const starfish = drawing('starfish', [
  f(star(50, 52, 40, 18)),
  f(cir(50, 52, 12)),
  f(cir(50, 32, 5)),
  f(cir(34, 62, 5)),
  f(cir(66, 62, 5)),
  ...eyes(50, 50, 6, 2.2),
]);

const seahorse = drawing('seahorse', [
  f(blob([[42, 24], [56, 30], [56, 52], [46, 72], [56, 86], [38, 84], [34, 62], [36, 40]])),
  f(ell(38, 20, 15, 13)),
  f(poly([[46, 10], [58, 4], [52, 18]])),
  f(poly([[56, 40], [70, 46], [56, 56]])),
  f(cir(26, 22, 6)),
  eye(34, 18, 2.6),
]);

const shark = drawing('shark', [
  f(blob([[8, 52], [34, 36], [66, 36], [88, 50], [64, 66], [32, 66]])),
  f(poly([[80, 46], [98, 30], [96, 60]])),
  f(poly([[44, 36], [52, 14], [62, 36]])),
  f(poly([[36, 64], [30, 80], [50, 68]])),
  f(cir(20, 48, 8)),
  eye(18, 46, 2.6),
  k(rr(10, 56, 22, 3, 1.5)),
]);

const jellyfish = drawing('jellyfish', [
  f(blob([[16, 44], [30, 22], [50, 16], [70, 22], [84, 44], [50, 52]])),
  f(rr(24, 50, 9, 34, 4.5)),
  f(rr(40, 52, 9, 38, 4.5)),
  f(rr(56, 52, 9, 38, 4.5)),
  f(rr(70, 50, 9, 34, 4.5)),
  ...eyes(50, 36, 9, 2.8),
]);

const snail = drawing('snail', [
  f(rr(16, 68, 62, 16, 8)),
  f(cir(58, 48, 24)),
  f(cir(58, 48, 12)),
  f(ell(20, 56, 13, 11)),
  f(rr(12, 30, 6, 18, 3)),
  f(rr(24, 30, 6, 18, 3)),
  eye(16, 54, 2.4),
]);

// Not a sea creature, but it keeps the gallery from being all animals and a
// toddler recognises it instantly.
const iceCream = drawing('ice-cream', [
  f(poly([[30, 50], [70, 50], [50, 94]])),
  f(cir(50, 42, 19)),
  f(cir(33, 30, 14)),
  f(cir(67, 30, 14)),
  f(cir(50, 18, 14)),
]);

export const SEA_DRAWINGS: readonly Drawing[] = [
  fish, whale, octopus, crab, turtle, starfish,
  seahorse, shark, jellyfish, snail, iceCream,
];
