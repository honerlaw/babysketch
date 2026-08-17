import type { Drawing } from '@/types/drawing';
import { blob, cir, drawing, ell, f, heart as heartPath, poly, rr, star } from '@/drawings/build';

/** Everyday objects, for variety beyond the animals. */

const sun = drawing('sun', [
  f(cir(50, 50, 26)),
  f(rr(44, 2, 12, 16, 6)),
  f(rr(44, 82, 12, 16, 6)),
  f(rr(2, 44, 16, 12, 6)),
  f(rr(82, 44, 16, 12, 6)),
  f(rr(14, 14, 14, 14, 6)),
  f(rr(72, 14, 14, 14, 6)),
  f(rr(14, 72, 14, 14, 6)),
  f(rr(72, 72, 14, 14, 6)),
]);

const bigStar = drawing('star', [
  f(star(50, 50, 44, 19)),
  f(star(50, 50, 22, 10)),
  f(cir(50, 50, 9)),
]);

const flower = drawing('flower', [
  f(rr(46, 52, 8, 44, 4)),
  f(ell(24, 66, 16, 9)),
  f(ell(76, 62, 16, 9)),
  f(cir(50, 16, 14)),
  f(cir(28, 30, 14)),
  f(cir(72, 30, 14)),
  f(cir(38, 52, 14)),
  f(cir(62, 52, 14)),
  f(cir(50, 34, 13)),
]);

const tree = drawing('tree', [
  f(rr(42, 56, 16, 40, 6)),
  f(cir(32, 42, 20)),
  f(cir(68, 42, 20)),
  f(cir(50, 26, 22)),
  f(cir(50, 50, 18)),
]);

const apple = drawing('apple', [
  f(blob([[50, 30], [74, 34], [82, 56], [66, 86], [50, 78], [34, 86], [18, 56], [26, 34]])),
  f(rr(46, 8, 8, 24, 4)),
  f(ell(70, 18, 15, 9)),
  f(ell(38, 48, 11, 15)),
]);

const house = drawing('house', [
  f(rr(18, 46, 64, 46, 4)),
  f(poly([[10, 48], [50, 12], [90, 48]])),
  f(rr(42, 66, 18, 26, 3)),
  f(rr(26, 56, 14, 14, 2)),
  f(rr(64, 56, 14, 14, 2)),
  f(rr(66, 20, 10, 18, 3)),
]);

const car = drawing('car', [
  f(rr(8, 48, 84, 26, 10)),
  f(rr(26, 26, 48, 24, 8)),
  f(rr(32, 30, 14, 14, 3)),
  f(rr(54, 30, 14, 14, 3)),
  f(cir(28, 76, 13)),
  f(cir(72, 76, 13)),
  f(cir(28, 76, 6)),
  f(cir(72, 76, 6)),
]);

const boat = drawing('boat', [
  f(poly([[10, 66], [90, 66], [76, 88], [24, 88]])),
  f(rr(46, 14, 8, 52, 4)),
  f(poly([[52, 18], [84, 58], [52, 58]])),
  f(poly([[44, 22], [16, 58], [44, 58]])),
  f(rr(6, 90, 88, 8, 4)),
]);

const balloon = drawing('balloon', [
  f(ell(50, 38, 30, 34)),
  f(poly([[44, 70], [56, 70], [50, 80]])),
  f(rr(46, 78, 8, 18, 4)),
  f(ell(38, 26, 9, 12)),
]);

const heart = drawing('heart', [
  f(heartPath(50, 52, 84, 76)),
  f(cir(34, 38, 10)),
  f(cir(64, 38, 10)),
]);

const rocket = drawing('rocket', [
  f(rr(36, 26, 28, 50, 12)),
  f(poly([[50, 4], [66, 30], [34, 30]])),
  f(poly([[36, 52], [18, 82], [36, 74]])),
  f(poly([[64, 52], [82, 82], [64, 74]])),
  f(cir(50, 40, 11)),
  f(poly([[40, 76], [60, 76], [50, 96]])),
]);

export const THING_DRAWINGS: readonly Drawing[] = [
  sun, bigStar, flower, tree, apple, house, car, boat, balloon, heart, rocket,
];
