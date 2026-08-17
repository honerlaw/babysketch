import type { Drawing } from '@/types/drawing';
import { cir, drawing, ell, eye, eyes, f, poly, rr } from '@/drawings/build';

/** Birds and bugs. */

const bird = drawing('bird', [
  f(ell(48, 54, 24, 18)),
  f(ell(52, 50, 16, 11)),
  f(poly([[68, 44], [90, 34], [86, 62]])),
  f(cir(26, 38, 13)),
  f(poly([[12, 38], [2, 42], [12, 46]])),
  f(rr(40, 70, 7, 16, 3.5)),
  f(rr(56, 70, 7, 16, 3.5)),
  eye(24, 34, 2.4),
]);

const owl = drawing('owl', [
  f(ell(50, 56, 28, 30)),
  f(ell(20, 54, 10, 20)),
  f(ell(80, 54, 10, 20)),
  f(poly([[26, 26], [30, 10], [42, 24]])),
  f(poly([[74, 26], [70, 10], [58, 24]])),
  f(cir(38, 40, 12)),
  f(cir(62, 40, 12)),
  f(poly([[46, 46], [50, 56], [54, 46]])),
  f(rr(38, 82, 9, 12, 4)),
  f(rr(53, 82, 9, 12, 4)),
  ...eyes(50, 40, 12, 4),
]);

const duck = drawing('duck', [
  f(ell(48, 60, 26, 18)),
  f(ell(58, 56, 16, 11)),
  f(rr(28, 30, 12, 24, 6)),
  f(cir(28, 26, 14)),
  f(ell(12, 30, 10, 6)),
  f(rr(38, 76, 9, 12, 4)),
  f(rr(54, 76, 9, 12, 4)),
  eye(26, 22, 2.4),
]);

const penguin = drawing('penguin', [
  f(ell(50, 54, 26, 34)),
  f(ell(50, 60, 16, 24)),
  f(ell(20, 54, 9, 20)),
  f(ell(80, 54, 9, 20)),
  f(cir(50, 26, 17)),
  f(poly([[44, 30], [56, 30], [50, 40]])),
  f(ell(36, 90, 13, 7)),
  f(ell(64, 90, 13, 7)),
  ...eyes(50, 22, 7, 2.6),
]);

const chick = drawing('chick', [
  f(cir(50, 60, 24)),
  f(cir(50, 30, 16)),
  f(poly([[44, 32], [56, 32], [50, 42]])),
  f(ell(24, 60, 10, 8)),
  f(ell(76, 60, 10, 8)),
  f(rr(40, 82, 7, 12, 3.5)),
  f(rr(54, 82, 7, 12, 3.5)),
  ...eyes(50, 26, 7, 2.6),
]);

const bee = drawing('bee', [
  f(ell(50, 58, 28, 20)),
  f(ell(30, 34, 16, 12)),
  f(ell(70, 34, 16, 12)),
  f(rr(42, 40, 8, 36, 3)),
  f(rr(58, 40, 8, 36, 3)),
  f(cir(20, 58, 11)),
  f(rr(11, 28, 7, 16, 3.5)),
  f(rr(25, 28, 7, 16, 3.5)),
  eye(18, 55, 2.4),
]);

const ladybug = drawing('ladybug', [
  f(cir(50, 56, 30)),
  f(cir(28, 30, 11)),
  f(rr(46, 26, 8, 60, 3)),
  f(cir(34, 46, 7)),
  f(cir(66, 46, 7)),
  f(cir(36, 70, 7)),
  f(cir(64, 70, 7)),
  ...eyes(28, 28, 5, 2.2),
]);

const flamingo = drawing('flamingo', [
  f(ell(52, 56, 24, 17)),
  f(ell(56, 52, 15, 10)),
  f(rr(30, 12, 10, 40, 5)),
  f(ell(28, 12, 13, 10)),
  f(poly([[14, 12], [3, 18], [16, 21]])),
  f(rr(44, 70, 8, 26, 4)),
  f(rr(58, 70, 8, 26, 4)),
  eye(26, 9, 2.4),
]);

export const SKY_DRAWINGS: readonly Drawing[] = [
  bird, owl, duck, penguin, chick, bee, ladybug, flamingo,
];
