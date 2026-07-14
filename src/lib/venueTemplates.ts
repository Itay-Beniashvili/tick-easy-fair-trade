// Seating Phase 1 — venue templates. Hand-authored polygons (normalized 0-100,
// SVG viewBox "0 0 100 100" friendly) for the 3 starter venue shapes, plus the
// deterministic capacity/price/grid math that turns a template into the exact
// `p_sections` payload `create_event_sections` (010_seating_schema.sql) expects:
//   {label, kind, price, capacity, color, geometry:{points:[[x,y],...]}, rows_count, seats_per_row}

export type TemplateId = 'theater' | 'arena' | 'club';
export type SectionKind = 'seated' | 'ga';

export type Point = [number, number]; // [x, y], normalized 0-100

export interface SectionTemplate {
  label: string;
  kind: SectionKind;
  /** Fraction of the venue's total capacity this section takes. All of a template's
   *  sections' capacityShare must sum to 1. */
  capacityShare: number;
  /** Multiplier applied to the event's base price for this section's price. */
  priceMultiplier: number;
  /** Gel token ('var(--music)' | 'var(--sports)' | 'var(--theater)') — matches
   *  venue_sections.color's CSS-var convention (consumed as hsl(var(--x))). */
  color: string;
  /** Hand-authored normalized-0-100 polygon. */
  geometry: { points: Point[] };
}

export interface VenueTemplate {
  id: TemplateId;
  label: string;
  description: string;
  /** Decorative-only stage marker for the mini preview — not persisted, not a section. */
  stage?: { points: Point[] };
  sections: SectionTemplate[];
}

const GEL_MUSIC = 'var(--music)';
const GEL_SPORTS = 'var(--sports)';
const GEL_THEATER = 'var(--theater)';

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

const THEATER: VenueTemplate = {
  id: 'theater',
  label: 'Theater',
  description: 'Stage up front, orchestra fan, mezzanine and balcony rows behind.',
  stage: { points: [[30, 4], [70, 4], [70, 10], [30, 10]] },
  sections: [
    {
      label: 'Orchestra',
      kind: 'seated',
      capacityShare: 0.5,
      priceMultiplier: 1.3,
      color: GEL_THEATER,
      // Fan shape widening away from the stage.
      geometry: { points: [[20, 14], [80, 14], [92, 45], [8, 45]] },
    },
    {
      label: 'Mezzanine',
      kind: 'seated',
      capacityShare: 0.3,
      priceMultiplier: 1.0,
      color: GEL_MUSIC,
      geometry: { points: [[15, 50], [85, 50], [80, 65], [20, 65]] },
    },
    {
      label: 'Balcony',
      kind: 'seated',
      capacityShare: 0.2,
      priceMultiplier: 0.7,
      color: GEL_SPORTS,
      geometry: { points: [[25, 70], [75, 70], [70, 85], [30, 85]] },
    },
  ],
};

const ARENA: VenueTemplate = {
  id: 'arena',
  label: 'Arena',
  description: 'GA floor surrounded by 4 curved stands — the classic arena bowl.',
  sections: [
    {
      label: 'Floor (GA)',
      kind: 'ga',
      capacityShare: 0.3,
      priceMultiplier: 1.5,
      color: GEL_MUSIC,
      geometry: { points: [[35, 35], [65, 35], [65, 65], [35, 65]] },
    },
    {
      label: 'North Stand',
      kind: 'seated',
      capacityShare: 0.175,
      priceMultiplier: 1.0,
      color: GEL_SPORTS,
      geometry: { points: [[20, 5], [80, 5], [70, 30], [30, 30]] },
    },
    {
      label: 'South Stand',
      kind: 'seated',
      capacityShare: 0.175,
      priceMultiplier: 1.0,
      color: GEL_SPORTS,
      geometry: { points: [[30, 70], [70, 70], [80, 95], [20, 95]] },
    },
    {
      label: 'East Stand',
      kind: 'seated',
      capacityShare: 0.175,
      priceMultiplier: 0.85,
      color: GEL_THEATER,
      geometry: { points: [[70, 30], [95, 20], [95, 80], [70, 70]] },
    },
    {
      label: 'West Stand',
      kind: 'seated',
      capacityShare: 0.175,
      priceMultiplier: 0.85,
      color: GEL_THEATER,
      geometry: { points: [[5, 20], [30, 30], [30, 70], [5, 80]] },
    },
  ],
};

const CLUB: VenueTemplate = {
  id: 'club',
  label: 'Club',
  description: 'Stage, GA floor for the crowd, small seated gallery at the back.',
  stage: { points: [[35, 5], [65, 5], [65, 15], [35, 15]] },
  sections: [
    {
      label: 'Floor (GA)',
      kind: 'ga',
      capacityShare: 0.75,
      priceMultiplier: 1.0,
      color: GEL_MUSIC,
      geometry: { points: [[15, 18], [85, 18], [90, 70], [10, 70]] },
    },
    {
      label: 'Gallery',
      kind: 'seated',
      capacityShare: 0.25,
      priceMultiplier: 1.15,
      color: GEL_THEATER,
      geometry: { points: [[20, 75], [80, 75], [75, 92], [25, 92]] },
    },
  ],
};

export const VENUE_TEMPLATES: Record<TemplateId, VenueTemplate> = {
  theater: THEATER,
  arena: ARENA,
  club: CLUB,
};

export const VENUE_TEMPLATE_LIST: VenueTemplate[] = [THEATER, ARENA, CLUB];

// ---------------------------------------------------------------------------
// buildSections — deterministic template -> p_sections payload
// ---------------------------------------------------------------------------

export interface SeatingSection {
  label: string;
  kind: SectionKind;
  price: number;
  capacity: number;
  color: string;
  geometry: { points: Point[] };
  rows_count: number | null;
  seats_per_row: number | null;
}

/** Largest-remainder rounding: split `total` across `shares` (fractions summing to 1)
 *  into integer capacities that sum EXACTLY to `total`, every part >= 1 (as long as
 *  total >= shares.length — the only case buildSections allows). Deterministic:
 *  remainder ties break by section index. */
export function distributeCapacity(total: number, shares: number[]): number[] {
  const raw = shares.map((s) => total * s);
  const floors = raw.map(Math.floor);
  const distributed = floors.reduce((a, b) => a + b, 0);
  let remaining = total - distributed;

  const order = floors
    .map((_, i) => i)
    .sort((a, b) => (raw[b] - floors[b]) - (raw[a] - floors[a]) || a - b);

  const result = [...floors];
  for (let k = 0; k < remaining && k < order.length; k++) {
    result[order[k]] += 1;
  }

  // Safety net: every section needs capacity > 0 (DB CHECK). Rob from the currently
  // largest section to fill any zero — only reachable when total >= shares.length,
  // which buildSections enforces before calling this.
  for (let i = 0; i < result.length; i++) {
    while (result[i] === 0) {
      let maxIdx = 0;
      for (let j = 1; j < result.length; j++) if (result[j] > result[maxIdx]) maxIdx = j;
      if (maxIdx === i || result[maxIdx] <= 1) break;
      result[maxIdx] -= 1;
      result[i] += 1;
    }
  }

  return result;
}

/** Derive a seated section's row grid from its capacity: aim for seats_per_row
 *  in [10,20] and rows_count <= 20 (well under the migration's 26-row cap),
 *  guaranteeing rows_count * seats_per_row >= capacity. Deterministic. */
export function deriveGrid(capacity: number): { rows_count: number; seats_per_row: number } {
  let seatsPerRow = Math.min(20, Math.max(10, Math.ceil(Math.sqrt(capacity))));
  let rows = Math.ceil(capacity / seatsPerRow);
  if (rows > 20) {
    rows = 20;
    // Very large sections: keep rows capped at 20 by widening rows instead
    // (still satisfies rows*seatsPerRow >= capacity; may exceed the 10-20 aim).
    seatsPerRow = Math.ceil(capacity / rows);
  }
  return { rows_count: Math.max(1, rows), seats_per_row: Math.max(1, seatsPerRow) };
}

/** Build the exact p_sections payload for `create_event_sections` from a template,
 *  a manager-chosen total capacity, and a base price. Deterministic: same inputs
 *  always produce the same output. */
export function buildSections(templateId: TemplateId, totalCapacity: number, basePrice: number): SeatingSection[] {
  const template = VENUE_TEMPLATES[templateId];
  if (!template) throw new Error(`unknown venue template: ${templateId}`);
  if (!Number.isFinite(totalCapacity) || !Number.isInteger(totalCapacity)) {
    throw new Error('totalCapacity must be an integer');
  }
  if (totalCapacity < template.sections.length) {
    throw new Error(`totalCapacity must be at least ${template.sections.length} for template "${templateId}"`);
  }

  const shares = template.sections.map((s) => s.capacityShare);
  const capacities = distributeCapacity(totalCapacity, shares);

  return template.sections.map((section, i): SeatingSection => {
    const capacity = capacities[i];
    const price = Math.round(basePrice * section.priceMultiplier);
    const grid = section.kind === 'seated' ? deriveGrid(capacity) : null;
    return {
      label: section.label,
      kind: section.kind,
      price,
      capacity,
      color: section.color,
      geometry: section.geometry,
      rows_count: grid ? grid.rows_count : null,
      seats_per_row: grid ? grid.seats_per_row : null,
    };
  });
}
