const STEP_MS = 1000 / 60;

/** Runs simulation updates at a fixed 60 Hz and renders once per browser frame. */
export function startGameLoop(update: (ticks: number) => void, render: (alpha: number) => void): () => void {
  let frameId = 0;
  let previous = 0;
  let accumulator = 0;
  let active = true;
  function frame(now: number) {
    if (!active) return;
    if (previous === 0) previous = now;
    accumulator += Math.min(now - previous, 250);
    previous = now;
    let steps = 0;
    while (accumulator >= STEP_MS && steps < 8) { update(1); accumulator -= STEP_MS; steps++; }
    render(accumulator / STEP_MS);
    frameId = requestAnimationFrame(frame);
  }
  frameId = requestAnimationFrame(frame);
  return () => { active = false; cancelAnimationFrame(frameId); };
}
