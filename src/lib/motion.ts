import type { Transition } from 'framer-motion';

/** Shared motion physics — every spring/ease in the app comes from here so
 *  the whole UI carries one consistent "weight". CSS twins of the easings
 *  live in index.css as --ease-swift / --ease-out-expo. */
export const spring: Transition = { type: 'spring', stiffness: 260, damping: 28, mass: 0.9 };
export const springSnappy: Transition = { type: 'spring', stiffness: 400, damping: 30 };
export const easeSwift = [0.32, 0.72, 0, 1] as const;
export const easeOutExpo = [0.16, 1, 0.3, 1] as const;
