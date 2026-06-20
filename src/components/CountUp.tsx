import { useEffect } from 'react';
import { animate, useMotionValue, useTransform, motion } from 'framer-motion';

/** Animates a number from 0 → value on mount (e.g. dashboard stats). */
export function CountUp({ value, format }: { value: number; format?: (n: number) => string }) {
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => {
    const n = Math.round(v);
    return format ? format(n) : n.toLocaleString();
  });
  useEffect(() => {
    const controls = animate(mv, value, { duration: 1.1, ease: [0.22, 1, 0.36, 1] });
    return controls.stop;
  }, [value, mv]);
  return <motion.span>{display}</motion.span>;
}
