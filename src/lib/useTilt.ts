import { useCallback, useMemo } from 'react';
import {
  useMotionValue, useSpring, useTransform, useMotionTemplate,
} from 'framer-motion';
import type { PointerEvent } from 'react';

/** Pointer-tracking 3D tilt + trailing gel glare for cards.
 *  Desktop-pointer only (hover:hover + pointer:fine) — `enabled` is false on
 *  touch, and callers must skip wiring handlers/transforms when it is.
 *  The glare uses a softer spring than the tilt on purpose: the light lags
 *  the card (follow-through), which is what makes it feel physical. */
export function useTilt(maxDeg = 6) {
  const enabled = useMemo(
    () => typeof window !== 'undefined'
      && window.matchMedia('(hover: hover) and (pointer: fine)').matches,
    [],
  );

  const px = useMotionValue(0.5); // pointer position within the card, 0..1
  const py = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(py, [0, 1], [maxDeg, -maxDeg]), { stiffness: 260, damping: 28, mass: 0.9 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-maxDeg, maxDeg]), { stiffness: 260, damping: 28, mass: 0.9 });

  const glareX = useSpring(useTransform(px, [0, 1], [10, 90]), { stiffness: 120, damping: 20 });
  const glareY = useSpring(useTransform(py, [0, 1], [10, 90]), { stiffness: 120, damping: 20 });
  const glare = useMotionTemplate`radial-gradient(240px circle at ${glareX}% ${glareY}%, hsl(var(--c) / 0.12), transparent 70%)`;

  const onPointerMove = useCallback((e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  }, [px, py]);

  const onPointerLeave = useCallback(() => {
    px.set(0.5);
    py.set(0.5);
  }, [px, py]);

  return { enabled, rotateX, rotateY, glare, onPointerMove, onPointerLeave };
}
