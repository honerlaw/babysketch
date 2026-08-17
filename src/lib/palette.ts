/**
 * The whole palette a toddler can reach. Twelve hues rather than the twenty-four
 * first sketched: at the wheel's radius, twenty-four sectors would give each only
 * ~23pt of arc, well under the 44pt touch floor.
 */
export const PAPER = '#FFFFFF';
export const INK = '#1F1B17';

export const HUES: readonly string[] = [
  '#E23B3B', // red
  '#F0602C', // orange-red
  '#F79A1E', // orange
  '#F7C51E', // amber
  '#EDE02B', // yellow
  '#A8D62B', // lime
  '#4CAF50', // green
  '#2BB6A3', // teal
  '#2D9BE0', // sky
  '#3B5FE2', // blue
  '#8B4FE0', // violet
  '#E24FA8', // pink
];

export const NEUTRALS: readonly string[] = [
  '#FFFFFF', // white
  '#F6D9C0', // light skin
  '#C98B54', // tan
  '#8B5A2B', // brown
  '#9AA3AB', // grey
  '#2B2B2B', // black
];

export const ALL_COLORS: readonly string[] = [...HUES, ...NEUTRALS];
