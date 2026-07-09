import type { CSSProperties } from 'react';

export type Category = 'music' | 'sports' | 'theater';

/** Each category is lit by its own stage gel. */
export const gelFor: Record<Category, string> = {
  music: 'var(--music)',
  sports: 'var(--sports)',
  theater: 'var(--theater)',
};

export function gelVar(genre: string): string {
  return gelFor[genre as Category] ?? 'var(--music)';
}

/** Expose the gel as --c for element-scoped styling (cards, chips). */
export function gelStyle(genre: string): CSSProperties {
  return { ['--c' as string]: gelVar(genre) } as CSSProperties;
}

/** Relight the whole app in this genre's gel (StageAmbience, buttons, nav all follow --gel). */
export function setGel(genre: string): void {
  document.documentElement.style.setProperty('--gel', gelVar(genre));
}

/** Back to the brand default (magenta). */
export function resetGel(): void {
  document.documentElement.style.setProperty('--gel', 'var(--music)');
}
