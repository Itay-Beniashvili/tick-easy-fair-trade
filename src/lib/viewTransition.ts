import { flushSync } from 'react-dom';

type Navigate = (to: string) => void;

/**
 * Navigate while morphing a shared element (the event image) from the list into
 * the detail hero, using the native View Transitions API. Falls back to a plain
 * navigation where the API isn't supported (Firefox / older browsers).
 */
export function navigateWithImageMorph(navigate: Navigate, to: string, el: HTMLElement | null) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => void };
  if (!doc.startViewTransition || !el) {
    navigate(to);
    return;
  }
  el.style.viewTransitionName = 'event-hero';
  const transition = doc.startViewTransition(() => {
    flushSync(() => navigate(to));
  });
  // Clean the name off the (still-mounted briefly) source once the snapshot is taken.
  Promise.resolve((transition as unknown as { finished?: Promise<void> })?.finished).finally(() => {
    el.style.viewTransitionName = '';
  });
}
