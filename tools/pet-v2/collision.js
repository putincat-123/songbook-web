export const WALK_BOUNDS = Object.freeze({
  minX: 15,
  maxX: 85,
  minY: 54,
  maxY: 84
});

export const STATIC_OBSTACLES = Object.freeze([
  { id: 'sofa', name: '沙发', x1: 5, x2: 42, y1: 62, y2: 72.5 },
  { id: 'coffee-table', name: '茶几', x1: 13, x2: 31, y1: 68, y2: 78 },
  { id: 'plant', name: '盆栽', x1: 38, x2: 46, y1: 71, y2: 76 },
  { id: 'basket', name: '篮子', x1: 3, x2: 27, y1: 77, y2: 86 }
]);

export function clampToWalkBounds(x, y, bounds = WALK_BOUNDS) {
  return {
    x: Math.max(bounds.minX, Math.min(bounds.maxX, x)),
    y: Math.max(bounds.minY, Math.min(bounds.maxY, y))
  };
}

export function hitTest(x, y, obstacles = STATIC_OBSTACLES) {
  return obstacles.find((item) =>
    x > item.x1 && x < item.x2 && y > item.y1 && y < item.y2
  ) || null;
}

export function resolveAxisMovement({ x, y, nextX, nextY, obstacles = STATIC_OBSTACLES }) {
  let resolvedX = x;
  let resolvedY = y;
  let blockedBy = null;

  if (nextX !== x) {
    const obstacle = hitTest(nextX, y, obstacles);
    if (obstacle) blockedBy = obstacle;
    else resolvedX = nextX;
  }

  if (nextY !== y) {
    const obstacle = hitTest(resolvedX, nextY, obstacles);
    if (obstacle) blockedBy = obstacle;
    else resolvedY = nextY;
  }

  return { x: resolvedX, y: resolvedY, blockedBy };
}
