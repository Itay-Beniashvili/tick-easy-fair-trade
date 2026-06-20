import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

/** Elegant purchase confirmation: a ticket "tears" along its perforation and the
 *  QR prints under a scan line, before the wallet opens. Deliberately restrained
 *  — no confetti. */
function qrCells(seed: number): boolean[] {
  return Array.from({ length: 64 }, (_, i) => {
    let h = (seed ^ (i * 2654435761)) >>> 0;
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    return ((h >>> 0) & 1) === 1;
  });
}

export function PurchaseSuccess({ title }: { title: string }) {
  const cells = qrCells(title.length * 97 + 7);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background/85 backdrop-blur-md grid place-items-center px-6"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        className="w-72"
      >
        {/* Top stub — lifts & tilts away like a torn ticket */}
        <motion.div
          initial={{ y: 0, rotate: 0 }}
          animate={{ y: -6, rotate: -1.5 }}
          transition={{ delay: 0.35, type: 'spring', stiffness: 200, damping: 14 }}
          className="relative h-28 rounded-t-2xl bg-gradient-to-br from-gel to-accent grid place-items-center overflow-hidden"
        >
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 16 }}
            className="w-14 h-14 rounded-full bg-background/20 grid place-items-center"
          >
            <Check className="w-8 h-8 text-primary-foreground" strokeWidth={3} />
          </motion.div>
        </motion.div>

        {/* Bottom stub with the "printing" QR */}
        <div className="relative bg-card rounded-b-2xl border border-white/[0.06] border-t-0 px-5 pt-6 pb-5 text-center stub-edge">
          <p className="font-display font-extrabold text-lg">Ticket secured</p>
          <p className="text-sm text-muted-foreground mb-4">Added to your wallet</p>

          <div className="relative mx-auto w-24 h-24 bg-white rounded-xl p-1.5 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="grid grid-cols-8 gap-px w-full h-full"
            >
              {cells.map((on, i) => (
                <div key={i} className={on ? 'bg-[#0E0D12] rounded-[1px]' : 'bg-white'} />
              ))}
            </motion.div>
            {/* scan line sweeps down as the code "prints" */}
            <motion.div
              initial={{ y: '-120%' }}
              animate={{ y: '120%' }}
              transition={{ delay: 0.45, duration: 0.7, ease: 'easeInOut' }}
              className="absolute inset-x-0 h-6 bg-gradient-to-b from-transparent via-[hsl(var(--gel)/0.6)] to-transparent"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
