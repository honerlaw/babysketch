/**
 * A drawing is data, never an image asset. Each shape's path data serves double
 * duty as both the colourable region and the black outline, which is what makes a
 * bucket fill impossible to leak: the region is closed by construction.
 */
export type Shape = {
  /** Path data in the drawing's viewBox space. One subpath: starts `M`, ends `Z`. */
  d: string;
  /** Colourable regions are tappable and take the child's colour. */
  fillable: boolean;
  /** Detail marks (eyes, nostrils, whiskers) that stay black and are never fillable. */
  ink?: boolean;
};

export type Drawing = {
  id: string;
  viewBox: [number, number];
  shapes: Shape[];
};
