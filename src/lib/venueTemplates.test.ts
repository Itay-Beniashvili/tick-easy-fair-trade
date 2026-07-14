import { describe, it, expect } from 'vitest';
import { buildSections, deriveGrid, VENUE_TEMPLATE_LIST, VENUE_TEMPLATES, type TemplateId } from './venueTemplates';

const TEMPLATE_IDS: TemplateId[] = ['theater', 'arena', 'club'];
const TOTALS = [7, 100, 953];
const BASE_PRICE = 250;

describe('VENUE_TEMPLATE_LIST', () => {
  it('every template capacityShares sum to 1', () => {
    for (const template of VENUE_TEMPLATE_LIST) {
      const sum = template.sections.reduce((acc, s) => acc + s.capacityShare, 0);
      expect(sum).toBeCloseTo(1, 9);
    }
  });
});

describe('buildSections — capacity conservation', () => {
  for (const templateId of TEMPLATE_IDS) {
    for (const total of TOTALS) {
      it(`${templateId} sums to exactly ${total}`, () => {
        const sections = buildSections(templateId, total, BASE_PRICE);
        const sum = sections.reduce((acc, s) => acc + s.capacity, 0);
        expect(sum).toBe(total);
        // Every section must have positive integer capacity (DB CHECK capacity > 0).
        for (const s of sections) {
          expect(Number.isInteger(s.capacity)).toBe(true);
          expect(s.capacity).toBeGreaterThan(0);
        }
      });
    }
  }
});

describe('buildSections — price multipliers', () => {
  it('applies round(basePrice * priceMultiplier) per section', () => {
    for (const templateId of TEMPLATE_IDS) {
      const sections = buildSections(templateId, 100, BASE_PRICE);
      const template = VENUE_TEMPLATES[templateId];
      sections.forEach((s, i) => {
        expect(s.price).toBe(Math.round(BASE_PRICE * template.sections[i].priceMultiplier));
      });
    }
  });

  it('rounds prices for a non-round base price too', () => {
    const sections = buildSections('club', 953, 133);
    const template = VENUE_TEMPLATES.club;
    sections.forEach((s, i) => {
      expect(s.price).toBe(Math.round(133 * template.sections[i].priceMultiplier));
    });
  });
});

describe('buildSections — seated grid constraints', () => {
  for (const templateId of TEMPLATE_IDS) {
    for (const total of TOTALS) {
      it(`${templateId}@${total}: every seated section has rows_count*seats_per_row >= capacity`, () => {
        const sections = buildSections(templateId, total, BASE_PRICE);
        for (const s of sections) {
          if (s.kind === 'seated') {
            expect(s.rows_count).not.toBeNull();
            expect(s.seats_per_row).not.toBeNull();
            expect((s.rows_count as number) * (s.seats_per_row as number)).toBeGreaterThanOrEqual(s.capacity);
            expect(s.rows_count as number).toBeLessThanOrEqual(20);
          } else {
            expect(s.rows_count).toBeNull();
            expect(s.seats_per_row).toBeNull();
          }
        }
      });
    }
  }
});

describe('deriveGrid', () => {
  it('keeps rows <= 20 and satisfies rows*perRow >= capacity across a wide capacity range', () => {
    for (const capacity of [1, 5, 10, 37, 100, 250, 429, 1000, 5000]) {
      const { rows_count, seats_per_row } = deriveGrid(capacity);
      expect(rows_count).toBeLessThanOrEqual(20);
      expect(rows_count * seats_per_row).toBeGreaterThanOrEqual(capacity);
    }
  });
});

describe('buildSections — determinism', () => {
  it('two calls with the same inputs produce deep-equal output', () => {
    for (const templateId of TEMPLATE_IDS) {
      for (const total of TOTALS) {
        const a = buildSections(templateId, total, BASE_PRICE);
        const b = buildSections(templateId, total, BASE_PRICE);
        expect(a).toEqual(b);
      }
    }
  });
});

describe('buildSections — validation', () => {
  it('rejects an unknown template id', () => {
    expect(() => buildSections('stadium' as TemplateId, 100, BASE_PRICE)).toThrow();
  });

  it('rejects a total capacity smaller than the template section count', () => {
    expect(() => buildSections('arena', 1, BASE_PRICE)).toThrow();
  });

  it('rejects a non-integer total capacity', () => {
    expect(() => buildSections('club', 10.5, BASE_PRICE)).toThrow();
  });
});
