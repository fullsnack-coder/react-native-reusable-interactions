/** Internal geometry; fractions refer to the measured usable modal viewport. */
export function validateSheetPoints(points: readonly number[], index: number) {
  if (
    !Array.isArray(points) ||
    points.length < 1 ||
    points.length > 4 ||
    points.some(
      (point, i) =>
        !Number.isFinite(point) ||
        point < 0.2 ||
        point > 1 ||
        (i > 0 && point <= points[i - 1]!)
    )
  )
    throw new Error(
      'InteractivePurchaseSheet snapPoints must contain 1..4 increasing fractions from 0.2 to 1'
    );
  if (!Number.isInteger(index) || index < 0 || index >= points.length)
    throw new Error(
      'InteractivePurchaseSheet snapIndex must identify a snap point'
    );
}
export function sheetHeights(
  points: readonly number[],
  available: number,
  minimum = 96
) {
  return points.map((point) =>
    Math.min(available, Math.max(minimum, point * available))
  );
}
export function sheetDestination(
  top: number,
  velocity: number,
  available: number,
  heights: readonly number[],
  dismissible: boolean
) {
  'worklet';
  const projected = Math.max(
    available - heights[heights.length - 1]!,
    Math.min(available, top + Math.max(-1200, Math.min(1200, velocity)) * 0.18)
  );
  let index = 0;
  let distance = Math.abs(projected - (available - heights[0]!));
  for (let i = 1; i < heights.length; i++) {
    const next = Math.abs(projected - (available - heights[i]!));
    if (next < distance) {
      distance = next;
      index = i;
    }
  }
  if (dismissible && Math.abs(available - projected) < distance) return -1;
  return index;
}
