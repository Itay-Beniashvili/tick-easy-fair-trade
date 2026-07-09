import { useReducedMotion } from 'framer-motion';

/** The living venue: 3 slow-sweeping gel light beams + 3 parallax dust layers.
 *  Pure CSS transforms (compositor-only), fixed at -z-10 behind all content,
 *  recolored live by --gel so category switches re-aim the stage lights.
 *  Fully unmounted under prefers-reduced-motion; dust is desktop-only. */
export function StageAmbience() {
  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="ambient-beam" />
      <div className="ambient-beam ambient-beam--reverse" style={{ animationDuration: '36s, 12s' }} />
      <div className="ambient-beam" style={{ animationDuration: '48s, 12s', opacity: 0.6 }} />
      <div className="ambient-dust hidden lg:block" />
      <div className="ambient-dust ambient-dust--md hidden lg:block" style={{ animationDuration: '90s' }} />
      <div className="ambient-dust ambient-dust--sm hidden lg:block" style={{ animationDuration: '120s' }} />
    </div>
  );
}
