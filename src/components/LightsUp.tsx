import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/** Cinematic "house lights up" intro shown once per session: the room is dark,
 *  stage lights sweep, the wordmark ignites, then the lights come up to reveal
 *  the app. Respects reduced motion via the global MotionConfig. */
export function LightsUp() {
  const [show, setShow] = useState(() => {
    try { return !sessionStorage.getItem('te_intro'); } catch { return true; }
  });

  useEffect(() => {
    if (show) { try { sessionStorage.setItem('te_intro', '1'); } catch { /* ignore */ } }
  }, [show]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 1.25, duration: 0.55, ease: 'easeInOut' }}
      onAnimationComplete={() => setShow(false)}
      className="fixed inset-0 z-[200] bg-[#0E0D12] grid place-items-center overflow-hidden"
    >
      {/* spotlight wash that grows from the center */}
      <motion.div
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="absolute w-[720px] h-[720px] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(closest-side, hsl(var(--gel) / 0.5), transparent 70%)' }}
      />

      {/* sweeping stage-light beams */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ x: '-70%', opacity: 0 }}
          animate={{ x: '70%', opacity: [0, 0.45, 0] }}
          transition={{ delay: 0.15 + i * 0.16, duration: 1.1, ease: 'easeInOut' }}
          className="absolute top-0 h-full w-40 -skew-x-12"
          style={{ left: `${18 + i * 26}%`, background: 'linear-gradient(90deg, transparent, hsl(var(--gel) / 0.28), transparent)' }}
        />
      ))}

      {/* wordmark ignites */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        className="relative flex items-center gap-3 font-display font-extrabold text-4xl text-foreground"
      >
        <motion.span
          initial={{ scale: 0, boxShadow: '0 0 0px 0px hsl(var(--gel) / 0)' }}
          animate={{ scale: 1, boxShadow: '0 0 22px 4px hsl(var(--gel) / 0.85)' }}
          transition={{ delay: 0.55, duration: 0.5, ease: 'backOut' }}
          className="w-4 h-4 rounded-full bg-gel"
        />
        TickEasy
      </motion.div>
    </motion.div>
  );
}
