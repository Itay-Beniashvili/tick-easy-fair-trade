import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, ChevronDown, Users, QrCode } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { easeOutExpo } from '@/lib/motion';

/** "Opening Night" — the cinematic public landing.
 *  Formula (studied from fixaplan/tenet): one full-bleed hero asset, mega
 *  editorial type with a single italic-serif accent word, and short
 *  typography-first story sections. The hero video is progressive: a CSS
 *  stage renders instantly, the video fades in over it when it can play,
 *  and reduced-motion never mounts it. */

const HERO_VIDEO = '/landing/hero.webm';
const HERO_POSTER = '/landing/hero.jpg';

function AccentWord({ children }: { children: string }) {
  return <span className="font-serif-accent font-normal">{children}</span>;
}

function HeroWords({ text, accent, delay = 0.2 }: { text: string; accent: string; delay?: number }) {
  const words = text.split(' ');
  return (
    <>
      {words.map((w, i) => (
        <motion.span
          key={i}
          className="inline-block whitespace-pre"
          initial={{ opacity: 0, y: '0.4em' }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + i * 0.07, duration: 0.6, ease: easeOutExpo }}
        >
          {w}{' '}
        </motion.span>
      ))}
      <motion.span
        className="inline-block"
        initial={{ opacity: 0, y: '0.4em' }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + words.length * 0.07 + 0.05, duration: 0.7, ease: easeOutExpo }}
      >
        <AccentWord>{accent}</AccentWord>
      </motion.span>
    </>
  );
}

interface StorySectionProps {
  gel: string;            // HSL triple, e.g. 'var(--music)'
  kicker: string;
  title: string;
  accent: string;
  copy: string;
  children?: React.ReactNode;
  flip?: boolean;
}

function StorySection({ gel, kicker, title, accent, copy, children, flip }: StorySectionProps) {
  return (
    <section className="relative py-28 lg:py-40 px-6 lg:px-16 overflow-hidden" style={{ ['--s' as string]: gel }}>
      {/* section gel field */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(60% 70% at ${flip ? '80%' : '20%'} 30%, hsl(var(--s) / 0.14), transparent 70%)` }}
      />
      <div className={`relative max-w-6xl mx-auto grid gap-12 lg:gap-20 items-center ${children ? 'lg:grid-cols-[1.2fr_1fr]' : ''} ${flip ? 'lg:[direction:rtl] lg:[&>*]:[direction:ltr]' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: easeOutExpo }}
        >
          <p className="font-mono text-[11px] tracking-[0.35em] uppercase mb-6" style={{ color: 'hsl(var(--s))' }}>
            {kicker}
          </p>
          <h2 className="font-display font-extrabold text-[clamp(2.6rem,6vw,5.5rem)] leading-[0.98] text-foreground mb-7">
            {title} <AccentWord>{accent}</AccentWord>
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl">{copy}</p>
        </motion.div>
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, delay: 0.15, ease: easeOutExpo }}
          >
            {children}
          </motion.div>
        )}
      </div>
    </section>
  );
}

/** Price-cap meter: the anti-scalping story told as a visual. */
function CapMeter() {
  return (
    <div className="card-elevated p-6 lg:p-8 max-w-md mx-auto w-full">
      <div className="flex items-baseline justify-between mb-2">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Resale price</span>
        <span className="font-mono font-bold text-2xl text-foreground">₪350</span>
      </div>
      <div className="relative h-3 rounded-full bg-muted overflow-hidden mb-2">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: 'linear-gradient(90deg, hsl(var(--success)), hsl(var(--music)))' }}
          initial={{ width: '0%' }}
          whileInView={{ width: '100%' }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: easeOutExpo, delay: 0.3 }}
        />
        <div className="absolute right-0 inset-y-0 w-0.5 bg-foreground" />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Face value cap</span>
        <span className="verified-badge"><Shield className="w-3 h-3" /> Enforced server-side</span>
      </div>
      <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
        A ticket can never be listed above what it cost. Not by policy — by code.
      </p>
    </div>
  );
}

/** A living ticket stub — the wallet story, in the app's own visual language. */
function StubDemo() {
  const cells = Array.from({ length: 64 }, (_, i) => ((i * 2654435761) >>> 3) % 3 !== 0);
  return (
    <div className="card-elevated overflow-hidden max-w-sm mx-auto w-full" style={{ ['--s' as string]: 'var(--theater)' }}>
      <div className="p-5 pb-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] mb-1" style={{ color: 'hsl(var(--s))' }}>Tonight · 20:00</p>
        <h3 className="font-display font-bold text-2xl">Hamilton — Broadway</h3>
        <p className="text-sm text-muted-foreground">Sec A · Row 3 · Seat 7</p>
      </div>
      <div className="stub-edge p-5 pt-6">
        <div className="mx-auto w-40 h-40 bg-white rounded-xl p-2 shadow-[0_0_36px_-4px_hsl(var(--s)/0.55)]">
          <div className="w-full h-full grid grid-cols-8 gap-0.5">
            {cells.map((on, i) => (
              <div key={i} className={`aspect-square rounded-[1px] ${on ? 'bg-[#0E0D12]' : 'bg-white'}`} />
            ))}
          </div>
        </div>
        <p className="text-center font-mono text-[10px] text-muted-foreground mt-3 tracking-widest">TE-8F42-K1</p>
      </div>
    </div>
  );
}

export default function Landing() {
  const reduced = useReducedMotion();
  const { user } = useAuth();
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const primaryCta = user ? { to: '/home', label: 'Open the app' } : { to: '/login', label: 'Find your show' };

  return (
    <div className="min-h-screen">
      {/* floating pill nav */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOutExpo }}
        className="fixed top-5 inset-x-0 z-50 flex justify-center px-4"
      >
        <div className="glass-effect rounded-full pl-5 pr-2 py-2 flex items-center gap-6 shadow-lg">
          <span className="flex items-center gap-2 font-display font-extrabold text-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-gel shadow-[0_0_10px_2px_hsl(var(--gel)/0.8)]" />
            TickEasy
          </span>
          {!user && (
            <Link to="/login" className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign in
            </Link>
          )}
          <Link to={primaryCta.to} className="btn-primary-gradient !px-5 !py-2 text-sm !rounded-full pressable">
            {primaryCta.label}
          </Link>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <header className="relative h-[100dvh] min-h-[640px] overflow-hidden flex flex-col items-center justify-center text-center px-6 pt-20 pb-16">
        {/* CSS stage — renders instantly, remains the fallback */}
        <div aria-hidden className="absolute inset-0 bg-gradient-hero" />
        <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(70% 55% at 50% 108%, hsl(var(--gel) / 0.3), transparent 65%)' }} />

        {/* hero video — fades in over the stage when playable */}
        {!reduced && !videoFailed && (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={HERO_POSTER}
            onCanPlay={() => setVideoReady(true)}
            onError={() => setVideoFailed(true)}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
            style={{ opacity: videoReady ? 1 : 0 }}
          >
            <source src={HERO_VIDEO} type="video/webm" />
          </video>
        )}
        {/* legibility scrim */}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-background via-background/45 to-background/70" />

        <div className="relative max-w-6xl">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="font-mono text-[11px] lg:text-xs tracking-[0.4em] uppercase text-gel mb-6"
          >
            Live shows · Fair tickets
          </motion.p>

          <h1 className="font-display font-extrabold text-[clamp(2.9rem,7.2vw,6.8rem)] leading-[0.97] text-foreground mb-8">
            <HeroWords text="The lights are going" accent="down." />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.6, ease: easeOutExpo }}
            className="text-lg lg:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Tickets at fair, capped prices — verified transfers, group buying,
            and zero scalping. Ever.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6, ease: easeOutExpo }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to={primaryCta.to} className="btn-primary-gradient pressable inline-flex items-center gap-2 text-lg !px-8 !py-4">
              {primaryCta.label} <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/manager/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4">
              I'm an event manager
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="absolute bottom-8 inset-x-0 flex justify-center"
        >
          <ChevronDown className="w-6 h-6 text-muted-foreground animate-float" />
        </motion.div>
      </header>

      {/* ── STORY ── */}
      <StorySection
        gel="var(--music)"
        kicker="Anti-scalping, enforced"
        title="Scalpers hate the"
        accent="house rules."
        copy="Every resale is capped at face value and every transfer reissues the barcode. The rules aren't a promise in the fine print — they run in the database, where no one can talk their way past them."
      >
        <CapMeter />
      </StorySection>

      <StorySection
        gel="var(--sports)"
        kicker="Group buying"
        title="Four friends. One"
        accent="checkout."
        copy="Open a group, share a link, and the seats are held while everyone pays their share. Nobody fronts the money, nobody gets left outside the gate."
        flip
      >
        <div className="card-elevated p-8 max-w-md mx-auto w-full" style={{ ['--s' as string]: 'var(--sports)' }}>
          <div className="flex -space-x-3 mb-6 justify-center">
            {['A', 'B', 'C', 'D'].map((ch, i) => (
              <motion.div
                key={ch}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.12, duration: 0.4 }}
                className="w-14 h-14 rounded-full border-2 border-card flex items-center justify-center font-display font-bold text-lg"
                style={{ background: `hsl(var(--s) / ${0.9 - i * 0.18})`, color: 'hsl(var(--background))' }}
              >
                {ch}
              </motion.div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" style={{ color: 'hsl(var(--s))' }} />
            4/4 paid · seats locked
          </div>
        </div>
      </StorySection>

      <StorySection
        gel="var(--theater)"
        kicker="Your wallet"
        title="Your ticket,"
        accent="alive."
        copy="Flip it over for the code, watch it glow under the scanner, resell it in two taps if plans change — inside the cap, always."
      >
        <StubDemo />
      </StorySection>

      {/* ── CLOSER ── */}
      <section className="relative py-32 px-6 text-center overflow-hidden">
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(50% 60% at 50% 100%, hsl(var(--gel) / 0.2), transparent 70%)' }} />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: easeOutExpo }}
          className="relative"
        >
          <h2 className="font-display font-extrabold text-[clamp(2.8rem,7vw,6.5rem)] leading-[0.98] mb-10">
            Take your <AccentWord>seat.</AccentWord>
          </h2>
          <Link to={primaryCta.to} className="btn-primary-gradient pressable inline-flex items-center gap-2 text-lg !px-10 !py-4">
            {primaryCta.label} <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      <footer className="border-t border-border px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-6xl mx-auto">
        <span className="flex items-center gap-2 font-display font-bold">
          <span className="w-2 h-2 rounded-full bg-gel" /> TickEasy
        </span>
        <p className="text-xs text-muted-foreground">Built for fair-trade ticketing.</p>
        <div className="flex items-center gap-5 text-xs text-muted-foreground">
          <Link to="/login" className="hover:text-foreground transition-colors">Sign in</Link>
          <Link to="/manager/login" className="hover:text-foreground transition-colors">Event managers</Link>
        </div>
      </footer>
    </div>
  );
}
