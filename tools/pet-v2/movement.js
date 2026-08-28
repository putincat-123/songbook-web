import { WALK_BOUNDS, clampToWalkBounds, resolveAxisMovement } from './collision.js';

export function createMovementController({
  anchor,
  onFacingChange = () => {},
  onStateChange = () => {},
  onPositionChange = () => {},
  speedX = 9,
  speedY = 6.3,
  start = { x: 45, y: 78 }
}) {
  let x = start.x;
  let y = start.y;
  let vx = 0;
  let vy = 0;
  let direction = 'front';
  let state = 'idle';
  let rafId = 0;
  let lastTime = 0;

  const render = () => {
    anchor.style.left = `${x}%`;
    anchor.style.top = `${y}%`;
    anchor.dataset.dir = direction;
    anchor.dataset.action = state;
    anchor.classList.toggle('walking', state === 'walk');
    onPositionChange({ x, y });
  };

  const stop = () => {
    vx = 0;
    vy = 0;
    state = 'idle';
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    onStateChange({ state, direction });
    render();
  };

  const tick = (now) => {
    const dt = Math.min(0.04, (now - lastTime) / 1000);
    lastTime = now;

    const beforeX = x;
    const beforeY = y;
    const wanted = clampToWalkBounds(x + vx * dt, y + vy * dt, WALK_BOUNDS);
    const resolved = resolveAxisMovement({ x, y, nextX: wanted.x, nextY: wanted.y });
    x = resolved.x;
    y = resolved.y;
    render();

    const atBoundary =
      (x <= WALK_BOUNDS.minX && vx < 0) ||
      (x >= WALK_BOUNDS.maxX && vx > 0) ||
      (y <= WALK_BOUNDS.minY && vy < 0) ||
      (y >= WALK_BOUNDS.maxY && vy > 0);
    const blockedInTravelDirection =
      (vx !== 0 && x === beforeX && wanted.x !== beforeX) ||
      (vy !== 0 && y === beforeY && wanted.y !== beforeY);

    if (atBoundary || blockedInTravelDirection) stop();
    else if (state === 'walk') rafId = requestAnimationFrame(tick);
  };

  const move = (nextDirection) => {
    direction = nextDirection;
    vx = nextDirection === 'left' ? -speedX : nextDirection === 'right' ? speedX : 0;
    vy = nextDirection === 'back' ? -speedY : nextDirection === 'front' ? speedY : 0;
    state = 'walk';
    onFacingChange(direction);
    onStateChange({ state, direction });
    if (!rafId) {
      lastTime = performance.now();
      rafId = requestAnimationFrame(tick);
    }
    render();
  };

  const getState = () => ({ x, y, direction, state });

  render();
  return { move, stop, getState };
}
