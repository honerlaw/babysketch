import type { Drawing } from '@/types/drawing';
import { cir, drawing, ell, eyes, f, k, poly, rr } from '@/drawings/build';

/**
 * Land animals. All side-on and built from the same chunky skeleton — tail, body,
 * two legs, ears, head, then any decoration last. Decoration goes last so no region
 * is ever enclosed by one drawn after it, which is what would make it untappable.
 * Ears always poke past the head's outline for the same reason.
 */

const bear = drawing('bear', [
  f(ell(50, 58, 27, 19)),
  f(rr(32, 72, 12, 21, 6)),
  f(rr(58, 72, 12, 21, 6)),
  f(cir(20, 26, 7)),
  f(cir(38, 24, 7)),
  f(cir(29, 38, 16)),
  f(ell(24, 44, 9, 7)),
  ...eyes(29, 34, 6, 2.2),
  k(cir(23, 43, 2.6)),
]);

const lion = drawing('lion', [
  f(rr(72, 46, 9, 22, 4.5)),
  f(ell(52, 58, 25, 18)),
  f(rr(34, 72, 11, 21, 5.5)),
  f(rr(58, 72, 11, 21, 5.5)),
  f(cir(27, 38, 21)),
  f(cir(27, 38, 14)),
  f(ell(27, 44, 8, 6)),
  ...eyes(27, 34, 6, 2.2),
  k(cir(27, 43, 2.4)),
]);

const tiger = drawing('tiger', [
  f(rr(73, 48, 8, 20, 4)),
  f(ell(50, 58, 26, 18)),
  f(rr(32, 72, 11, 21, 5.5)),
  f(rr(58, 72, 11, 21, 5.5)),
  f(poly([[16, 26], [20, 12], [28, 24]])),
  f(poly([[38, 24], [34, 12], [28, 24]])),
  f(cir(26, 38, 16)),
  f(rr(44, 44, 7, 20, 3.5)),
  f(rr(56, 44, 7, 20, 3.5)),
  ...eyes(26, 34, 6, 2.2),
  k(cir(26, 44, 2.4)),
]);

const cow = drawing('cow', [
  f(rr(73, 46, 8, 22, 4)),
  f(ell(52, 56, 27, 18)),
  f(rr(34, 70, 11, 23, 5.5)),
  f(rr(60, 70, 11, 23, 5.5)),
  f(ell(12, 34, 7, 9)),
  f(ell(40, 34, 7, 9)),
  f(cir(26, 38, 15)),
  f(ell(26, 46, 10, 7)),
  f(ell(58, 52, 10, 8)),
  ...eyes(26, 34, 6, 2.2),
  k(cir(23, 46, 2.2)),
  k(cir(30, 46, 2.2)),
]);

const pig = drawing('pig', [
  f(ell(52, 58, 26, 18)),
  f(rr(36, 72, 11, 20, 5.5)),
  f(rr(60, 72, 11, 20, 5.5)),
  f(poly([[16, 28], [22, 16], [28, 28]])),
  f(poly([[36, 28], [30, 16], [24, 28]])),
  f(cir(26, 40, 15)),
  f(ell(22, 46, 9, 7)),
  f(rr(74, 50, 8, 14, 4)),
  ...eyes(26, 36, 6, 2.2),
  k(cir(20, 46, 2)),
  k(cir(25, 46, 2)),
]);

const sheep = drawing('sheep', [
  f(cir(38, 56, 14)),
  f(cir(58, 54, 15)),
  f(cir(48, 68, 14)),
  f(rr(38, 76, 8, 16, 4)),
  f(rr(58, 76, 8, 16, 4)),
  f(ell(14, 40, 8, 6)),
  f(ell(38, 38, 8, 6)),
  f(ell(26, 42, 13, 14)),
  ...eyes(26, 40, 5, 2.2),
]);

const horse = drawing('horse', [
  f(rr(74, 44, 8, 24, 4)),
  f(ell(52, 56, 26, 17)),
  f(rr(34, 70, 10, 24, 5)),
  f(rr(60, 70, 10, 24, 5)),
  f(rr(24, 26, 12, 26, 6)),
  f(ell(22, 22, 12, 11)),
  f(poly([[14, 16], [18, 4], [24, 16]])),
  ...eyes(22, 20, 5, 2.2),
  k(cir(14, 24, 2.2)),
]);

const rabbit = drawing('rabbit', [
  f(ell(52, 66, 22, 17)),
  f(rr(38, 78, 10, 16, 5)),
  f(rr(58, 78, 10, 16, 5)),
  f(ell(38, 22, 7, 18)),
  f(ell(54, 22, 7, 18)),
  f(cir(46, 46, 16)),
  f(cir(74, 66, 8)),
  ...eyes(46, 42, 6, 2.4),
  k(cir(46, 51, 2.4)),
]);

const mouse = drawing('mouse', [
  f(rr(72, 56, 20, 8, 4)),
  f(ell(46, 62, 22, 16)),
  f(rr(34, 74, 9, 14, 4.5)),
  f(rr(54, 74, 9, 14, 4.5)),
  f(cir(22, 36, 11)),
  f(cir(40, 34, 11)),
  f(cir(30, 48, 15)),
  ...eyes(30, 44, 6, 2.2),
  k(cir(19, 52, 2.6)),
]);

const fox = drawing('fox', [
  f(ell(74, 60, 18, 9)),
  f(ell(50, 60, 24, 16)),
  f(rr(34, 72, 10, 18, 5)),
  f(rr(56, 72, 10, 18, 5)),
  f(poly([[16, 32], [18, 16], [30, 30]])),
  f(poly([[38, 30], [36, 14], [26, 30]])),
  f(poly([[10, 46], [30, 30], [42, 44], [26, 56]])),
  ...eyes(26, 38, 6, 2.2),
  k(cir(11, 46, 2.4)),
]);

const monkey = drawing('monkey', [
  f(ell(52, 62, 20, 18)),
  f(rr(36, 76, 10, 17, 5)),
  f(rr(58, 76, 10, 17, 5)),
  f(rr(70, 40, 9, 26, 4.5)),
  f(cir(22, 40, 8)),
  f(cir(58, 40, 8)),
  f(cir(40, 40, 18)),
  f(ell(40, 46, 12, 9)),
  ...eyes(40, 36, 6, 2.4),
  k(cir(40, 44, 2.2)),
]);

const panda = drawing('panda', [
  f(ell(50, 62, 24, 19)),
  f(rr(32, 76, 12, 18, 6)),
  f(rr(58, 76, 12, 18, 6)),
  f(cir(34, 26, 8)),
  f(cir(66, 26, 8)),
  f(cir(50, 40, 18)),
  f(cir(42, 37, 6)),
  f(cir(58, 37, 6)),
  ...eyes(50, 37, 8, 2.2),
  k(cir(50, 46, 3)),
]);

const hippo = drawing('hippo', [
  f(ell(54, 60, 28, 18)),
  f(rr(36, 74, 12, 18, 6)),
  f(rr(62, 74, 12, 18, 6)),
  f(cir(24, 30, 6)),
  f(cir(40, 30, 6)),
  f(ell(28, 46, 20, 15)),
  f(ell(22, 52, 11, 8)),
  ...eyes(32, 40, 6, 2.2),
  k(cir(18, 52, 2.2)),
  k(cir(26, 52, 2.2)),
]);

const zebra = drawing('zebra', [
  f(rr(74, 46, 8, 22, 4)),
  f(ell(52, 56, 26, 17)),
  f(rr(34, 70, 10, 24, 5)),
  f(rr(60, 70, 10, 24, 5)),
  f(rr(24, 26, 12, 26, 6)),
  f(ell(22, 22, 12, 11)),
  f(rr(44, 42, 7, 26, 3)),
  f(rr(56, 42, 7, 26, 3)),
  ...eyes(22, 20, 5, 2.2),
]);

const frog = drawing('frog', [
  f(ell(50, 62, 26, 18)),
  f(ell(22, 74, 14, 8)),
  f(ell(78, 74, 14, 8)),
  f(cir(34, 34, 10)),
  f(cir(66, 34, 10)),
  f(ell(50, 46, 24, 18)),
  ...eyes(50, 32, 16, 3.2),
  k(rr(38, 52, 24, 3, 1.5)),
]);

const deer = drawing('deer', [
  f(rr(72, 48, 8, 16, 4)),
  f(ell(52, 58, 24, 17)),
  f(rr(36, 72, 9, 22, 4.5)),
  f(rr(60, 72, 9, 22, 4.5)),
  f(rr(26, 28, 11, 24, 5.5)),
  f(poly([[12, 22], [8, 6], [20, 18]])),
  f(poly([[34, 20], [40, 6], [42, 20]])),
  f(ell(24, 24, 12, 10)),
  ...eyes(24, 22, 5, 2.2),
  k(cir(16, 26, 2.2)),
]);

export const LAND_DRAWINGS: readonly Drawing[] = [
  bear, lion, tiger, cow, pig, sheep, horse, rabbit,
  mouse, fox, monkey, panda, hippo, zebra, frog, deer,
];
