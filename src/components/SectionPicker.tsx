import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatILS } from '@/lib/currency';
import type { VenueSectionRow } from '@/api/seats';
import { remaining, isSoldOut, pickBestAvailable, clampQuantity, sectionPoints, pointsToStr } from '@/lib/sections';

interface SectionPickerProps {
  sections: VenueSectionRow[];
  /** True while any purchase (section or otherwise) is in flight on the page. */
  busy: boolean;
  /** Performs the purchase (and the success overlay / navigate / refetch that follow it)
   *  in the parent — this component only owns sheet UI state and rethrows/toasts errors. */
  onPurchase: (sectionId: string, quantity: number) => Promise<void>;
}

interface SectionView {
  section: VenueSectionRow;
  points: [number, number][];
  remaining: number;
  soldOut: boolean;
}

/** Venue silhouette + zone sheet — the buyer-facing seat picker for events with
 *  sections. The map is orientation; the legend rows underneath are equally valid
 *  tap targets (and the real selection surface on small screens). */
export function SectionPicker({ sections, busy, onPurchase }: SectionPickerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null); // hover OR keyboard focus
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const views = useMemo<SectionView[]>(
    () =>
      sections.map((section) => ({
        section,
        points: sectionPoints(section),
        remaining: remaining(section),
        soldOut: isSoldOut(section),
      })),
    [sections],
  );

  const selected = views.find((v) => v.section.id === selectedId) ?? null;
  const bestAvailable = useMemo(() => pickBestAvailable(sections), [sections]);
  const maxQty = selected ? Math.min(6, selected.remaining) : 1;

  const openSection = (sectionId: string, initialQuantity = 1) => {
    if (busy) return;
    const view = views.find((v) => v.section.id === sectionId);
    if (!view || view.soldOut) return;
    setSelectedId(sectionId);
    setQuantity(clampQuantity(initialQuantity, view.section));
  };

  const closeSheet = () => {
    if (submitting) return;
    setSelectedId(null);
  };

  const handleConfirm = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await onPurchase(selected.section.id, quantity);
      setSelectedId(null);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => bestAvailable && openSection(bestAvailable.id, 1)}
        disabled={!bestAvailable || busy}
        className="w-full py-3.5 rounded-2xl border-2 border-primary text-primary font-semibold flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-ring"
      >
        <Sparkles className="w-4 h-4" />
        {bestAvailable ? `Best available · ${formatILS(bestAvailable.price)}` : 'Sold out'}
      </button>

      <svg viewBox="0 0 100 100" className="w-full h-auto rounded-2xl bg-muted/40" aria-hidden="true">
        {/* Decorative stage marker — orients the map, not a section. */}
        <g aria-hidden="true">
          <rect x={32} y={2} width={36} height={7} rx={2} className="fill-foreground/15" />
          <text x={50} y={7.3} textAnchor="middle" className="fill-foreground/50" style={{ fontSize: 3.2, letterSpacing: 1 }}>
            STAGE
          </text>
        </g>

        {views.map(({ section, points, remaining: left, soldOut }) => {
          const isSelected = selectedId === section.id;
          const isActive = activeId === section.id;
          const fillAlpha = isSelected ? 0.45 : isActive ? 0.35 : 0.25;
          const strokeAlpha = isSelected ? 0.85 : 0.6;
          const strokeWidth = isSelected ? 2 : isActive ? 1.4 : 1;
          const fill = soldOut ? 'hsl(258 9% 45% / 0.12)' : `hsl(${section.color} / ${fillAlpha})`;
          const stroke = soldOut ? 'hsl(258 9% 45% / 0.4)' : `hsl(${section.color} / ${strokeAlpha})`;
          const label = soldOut
            ? `${section.label} — Sold out`
            : `${section.label} — ${formatILS(section.price)}, ${left} available`;

          return (
            <g
              key={section.id}
              role="button"
              tabIndex={soldOut ? -1 : 0}
              aria-label={label}
              aria-disabled={soldOut}
              aria-pressed={isSelected}
              onClick={() => openSection(section.id)}
              onKeyDown={(e) => {
                if (soldOut) return;
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openSection(section.id);
                }
              }}
              onMouseEnter={() => !soldOut && setActiveId(section.id)}
              onMouseLeave={() => setActiveId((id) => (id === section.id ? null : id))}
              onFocus={() => !soldOut && setActiveId(section.id)}
              onBlur={() => setActiveId((id) => (id === section.id ? null : id))}
              className={cn('outline-none transition-[filter] duration-150', soldOut ? 'cursor-not-allowed' : 'cursor-pointer')}
              style={{ filter: isSelected ? `drop-shadow(0 0 6px hsl(${section.color} / 0.65))` : undefined }}
            >
              <polygon
                points={pointsToStr(points)}
                style={{ fill, stroke, strokeWidth, transition: 'fill 150ms ease, stroke-width 150ms ease' }}
              />
            </g>
          );
        })}
      </svg>

      <div className="space-y-2">
        {views.map(({ section, remaining: left, soldOut }) => {
          const isSelected = selectedId === section.id;
          return (
            <button
              key={section.id}
              type="button"
              disabled={soldOut || busy}
              aria-pressed={isSelected}
              onClick={() => openSection(section.id)}
              className={cn(
                'w-full min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-colors focus-ring',
                soldOut
                  ? 'border-border/50 opacity-50 cursor-not-allowed'
                  : isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted',
              )}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ background: soldOut ? 'hsl(258 9% 45%)' : `hsl(${section.color})` }}
              />
              <span className="flex-1 min-w-0">
                <span className="block font-medium text-sm text-foreground truncate">{section.label}</span>
                <span className="block text-xs text-muted-foreground">{soldOut ? 'Sold out' : `${left} left`}</span>
              </span>
              <span className="font-semibold text-sm text-foreground shrink-0">{formatILS(section.price)}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center sm:items-center"
            onClick={closeSheet}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-elevated max-h-[92vh] overflow-y-auto scrollbar-hide"
            >
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={closeSheet}
                  disabled={submitting}
                  aria-label="Close"
                  className="w-11 h-11 grid place-items-center hover:bg-muted rounded-full transition-colors focus-ring disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
                <h2 className="text-xl font-bold text-foreground truncate px-2">{selected.section.label}</h2>
                <div className="w-11" />
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground">Price per ticket</span>
                <span className="text-2xl font-bold text-gradient-warm">{formatILS(selected.section.price)}</span>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span>{selected.section.sold} sold</span>
                  <span>{selected.section.capacity} capacity</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-[width] duration-300"
                    style={{
                      width: `${Math.min(100, (selected.section.sold / selected.section.capacity) * 100)}%`,
                      background: `hsl(${selected.section.color})`,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-medium text-foreground">Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || submitting}
                    aria-label="Decrease quantity"
                    className="w-11 h-11 grid place-items-center rounded-full border border-border text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed focus-ring"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-bold text-lg text-foreground tabular-nums">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                    disabled={quantity >= maxQty || submitting}
                    aria-label="Increase quantity"
                    className="w-11 h-11 grid place-items-center rounded-full border border-border text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed focus-ring"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6 pt-4 border-t border-border">
                <span className="text-muted-foreground font-medium">Total</span>
                <span className="text-3xl font-bold text-gradient-warm">{formatILS(selected.section.price * quantity)}</span>
              </div>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={submitting || busy}
                className="w-full btn-primary-gradient py-4 text-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Processing…' : `Get ${quantity} seat${quantity > 1 ? 's' : ''} · ${formatILS(selected.section.price * quantity)}`}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
