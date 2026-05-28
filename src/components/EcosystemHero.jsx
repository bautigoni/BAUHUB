import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, createTimeline, utils, stagger } from 'animejs';
import { motion } from 'framer-motion';
import { APPS } from '../data.js';

/**
 * EcosystemHero
 *
 * One sticky stage. A SINGLE persistent rAF master loop runs at all times and
 * combines two inputs:
 *   • a time clock  (performance.now)  → idle motion, never lets the scene die
 *   • a lerp-smoothed scroll progress  → scrubbed narrative, no snapping
 *
 * Scroll/resize only cache a target; the loop eases toward it every frame, so
 * the ecosystem keeps breathing, drifting and shimmering even when the user
 * stops scrolling. animejs drives the decorative idle loops (intro timeline,
 * node-halo pulses, traveling connector energy pulses); framer-motion drives
 * the focus-panel content entrance and CTA hover.
 *
 *   0.00 .. 0.85   intro      — orb dominant, wordmark + tagline
 *   0.55 .. 1.70   boot-up    — orbits draw out, nodes ignite, "ecosistema"
 *   1.90 .. 7.80   focus 1..6 — one app emphasized at a time, panel + number
 */

const STAGE_COUNT = 8;

// ── Orbital system ──────────────────────────────────────────────────────
// The app nodes ride a single elliptical orbit around the core. Each node's
// angle is a function of scroll progress, so they physically rotate as you
// scroll (one direction down, back up). The node nearest the focal point
// (front / bottom of the ellipse) is the "active" one.
const ORBIT_RX = 37;             // horizontal radius (vmin) — wider…
const ORBIT_RY = 21;             // …than tall → elliptical perspective
const FOCAL_ANGLE = Math.PI / 2; // bottom-front of the ellipse = in-focus spot
const SLOT = (Math.PI * 2) / APPS.length;

// Initial (focusFloat = 0) layout — used for first paint before the loop runs.
const NODE_POS = APPS.map((_, i) => {
  const a = FOCAL_ANGLE + i * SLOT;
  return { x: Math.cos(a) * ORBIT_RX, y: Math.sin(a) * ORBIT_RY };
});

// Concentric, axis-aligned orbit rings. The first (`main`) is the visible path
// the nodes ride; the others add faint depth. Slightly brighter than before.
const RINGS = [
  { m: 1.00, op: 0.30, main: true },
  { m: 0.60, op: 0.10 },
  { m: 1.34, op: 0.07 },
];

const SPARKS = [
  { x: -18, y: -34, s: 1.4 }, { x:  22, y: -30, s: 1.2 }, { x: -40, y: -10, s: 1.1 },
  { x:  42, y: -12, s: 1.1 }, { x: -10, y:  34, s: 1.2 }, { x:  16, y:  36, s: 1.0 },
  { x: -52, y:  22, s: 1.0 }, { x:  50, y:  24, s: 1.0 }, { x:   0, y: -42, s: 1.0 },
  { x: -28, y:  16, s: 0.9 }, { x:  30, y:  14, s: 0.9 }, { x:   8, y: -16, s: 0.9 },
  { x: -8,  y:  -2, s: 0.8 }, { x:  60, y:  -2, s: 0.9 },
];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (t) => t * t * (3 - 2 * t);
const smoothstep = (e0, e1, x) => smooth(clamp((x - e0) / (e1 - e0), 0, 1));
const lerp = (a, b, t) => a + (b - a) * t;

const ACCENT = '47,128,237';
const ACCENT_HI = '86,182,255';
const ACCENT_SOFT = '127,210,255';

export default function EcosystemHero({ copy, lang }) {
  const wrapRef = useRef(null);
  const haloRef = useRef(null);
  const orbRef = useRef(null);
  const constellationRef = useRef(null);

  // intro content
  const introRef = useRef(null);
  const letterRefs = useRef([]);
  const eyebrowRef = useRef(null);
  const metaRef = useRef(null);
  const ruleRef = useRef(null);
  const taglineRef = useRef(null);
  const subRef = useRef(null);
  const sigRef = useRef(null);
  const ctaRef = useRef(null);
  const scrollHintRef = useRef(null);

  // ecosystem overview heading
  const ecoHeadingRef = useRef(null);

  // network refs
  const ringRefs = useRef([]);
  const connRefs = useRef([]);
  const flowRefs = useRef([]);
  const sparkRefs = useRef([]);
  const nodeWrapRefs = useRef([]);
  const nodeChipRefs = useRef([]);
  const nodeHaloRefs = useRef([]);
  const nodeLabelRefs = useRef([]);

  // focus panel
  const panelRef = useRef(null);
  const numberRef = useRef(null);

  const [active, setActive] = useState(-1);
  const activeRef = useRef(-1);
  const introDoneRef = useRef(false);
  const mouseRef = useRef({ x: 0, y: 0, mx: 0, my: 0 });

  const WORD = 'BauHub';

  // ── Intro entrance (anime.js, one-shot) ─────────────────────────────────
  useLayoutEffect(() => {
    utils.set(letterRefs.current.filter(Boolean), {
      opacity: 0, translateY: 70, filter: 'blur(12px)',
    });
    utils.set(
      [eyebrowRef.current, metaRef.current, ruleRef.current, taglineRef.current,
       subRef.current, sigRef.current, scrollHintRef.current, haloRef.current].filter(Boolean),
      { opacity: 0 }
    );
    if (ctaRef.current) utils.set(Array.from(ctaRef.current.children), { opacity: 0, translateY: 16 });
    if (orbRef.current) utils.set(orbRef.current, { opacity: 0, scale: 0.82 });

    const tl = createTimeline({
      defaults: { ease: 'outExpo' },
      onComplete: () => { introDoneRef.current = true; },
    });

    tl.add(haloRef.current, { opacity: 1, duration: 1700, ease: 'outQuint' })
      .add(orbRef.current, { opacity: 1, scale: [0.82, 1], duration: 1600, ease: 'outQuint' }, '-=1450')
      .add(eyebrowRef.current, { opacity: 1, translateY: [14, 0], duration: 900 }, '-=1200')
      .add(
        letterRefs.current.filter(Boolean),
        { opacity: 1, translateY: 0, filter: 'blur(0px)', duration: 1100, delay: stagger(64, { start: -300 }) },
        '-=900'
      )
      .add(metaRef.current, { opacity: 1, duration: 800 }, '-=700')
      .add(ruleRef.current, { opacity: 1, scaleX: [0.3, 1], duration: 900 }, '-=750')
      .add(taglineRef.current, { opacity: 1, translateY: [20, 0], duration: 900 }, '-=650')
      .add(subRef.current, { opacity: 1, translateY: [14, 0], duration: 800 }, '-=650')
      .add(sigRef.current, { opacity: 1, translateY: [12, 0], duration: 700 }, '-=600')
      .add(
        Array.from(ctaRef.current?.children ?? []),
        { opacity: 1, translateY: [16, 0], duration: 700, delay: stagger(90) },
        '-=520'
      )
      .add(scrollHintRef.current, { opacity: 0.55, duration: 700 }, '-=300');

    const safety = setTimeout(() => { introDoneRef.current = true; }, 6000);
    return () => { tl.pause(); clearTimeout(safety); };
  }, []);

  // ── animejs idle loops (decorative; coexist with the master loop) ────────
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const halos = nodeHaloRefs.current.filter(Boolean);
    const flows = flowRefs.current.filter(Boolean);

    // soft sonar rings expanding from each node, staggered
    const haloAnim = halos.length && animate(halos, {
      scale: [0.6, 1.9],
      opacity: [{ to: 0.42, duration: 0 }, { to: 0, duration: 2600 }],
      duration: 2600,
      delay: stagger(360),
      loop: true,
      ease: 'outSine',
    });

    // energy pulses travelling hub → node along each connector
    const flowAnim = flows.length && animate(flows, {
      strokeDashoffset: [1, 0],
      duration: 2200,
      delay: stagger(300),
      loop: true,
      ease: 'inOutSine',
    });

    return () => {
      if (haloAnim) haloAnim.pause();
      if (flowAnim) flowAnim.pause();
    };
  }, []);

  // ── Master loop: ALWAYS running. time clock + smoothed scroll progress ───
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let targetP = 0;
    let smoothP = 0;
    let raf = null;
    let lastActive = -1;
    const t0 = performance.now();

    const readScroll = () => {
      const rect = wrap.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = (STAGE_COUNT - 1) * vh;
      targetP = clamp(-rect.top, 0, total) / vh; // 0 .. STAGE_COUNT-1
    };

    const frame = (now) => {
      const t = (now - t0) / 1000; // seconds
      // ease scroll toward target — this is what kills the "snap/teleport" feel
      smoothP += (targetP - smoothP) * (reduce ? 1 : 0.085);
      const p = smoothP;
      const vh = window.innerHeight;
      const mx = mouseRef.current.mx;
      const my = mouseRef.current.my;

      // ── intro fade / lift (0 → 0.85) ──
      const introOut = smoothstep(0, 0.85, p);
      if (introDoneRef.current && introRef.current) {
        introRef.current.style.opacity = String(1 - introOut);
        introRef.current.style.transform = `translate3d(0, ${-introOut * 40}px, 0)`;
        introRef.current.style.pointerEvents = introOut > 0.5 ? 'none' : 'auto';
      }
      if (scrollHintRef.current) {
        scrollHintRef.current.style.opacity = String(0.55 * (1 - smoothstep(0, 0.4, p)));
      }

      // ── orb: settle + perpetual breathing ──
      const breathe = reduce ? 0 : Math.sin(t * 0.85);
      if (orbRef.current && introDoneRef.current) {
        const settle = smoothstep(0, 1.2, p);
        const oy = (1 - settle) * (-vh * 0.05);
        const os = (1 - settle * 0.16) * (1 + breathe * 0.014);
        orbRef.current.style.transform =
          `translate(-50%, -50%) translate3d(${mx * 8}px, ${oy + my * 5}px, 0) scale(${os})`;
      }
      if (haloRef.current && introDoneRef.current) {
        const hs = (1 + smoothstep(0, 1.2, p) * 0.06) * (1 + breathe * 0.03);
        haloRef.current.style.transform =
          `translate(-50%, -50%) translate3d(${mx * 14}px, ${my * 9}px, 0) scale(${hs})`;
        haloRef.current.style.opacity = String(0.78 + breathe * 0.16);
      }

      // ── network boot-up (scrubbed) ──
      const boot = smoothstep(0.55, 1.5, p);

      // orbit rings: expand from orb + perpetual subtle shimmer (no rotation —
      // the ellipse itself stays put; the *nodes* are what orbit along it)
      RINGS.forEach((ring, i) => {
        const el = ringRefs.current[i];
        if (!el) return;
        const r = smoothstep(0, 0.85, boot);
        const shimmer = reduce ? 1 : 0.82 + 0.18 * Math.sin(t * 0.6 + i * 1.3);
        el.style.opacity = String(r * ring.op * shimmer);
        const s = (0.55 + 0.45 * r) * (1 + (reduce ? 0 : breathe * 0.008));
        el.style.transform = `translate(-50%, -50%) scale(${s})`;
      });

      // sparks: settle + gentle parallax drift + twinkle
      SPARKS.forEach((s, i) => {
        const el = sparkRefs.current[i];
        if (!el) return;
        const dx = reduce ? 0 : Math.sin(t * 0.4 + i * 1.3) * 1.4;
        const dy = reduce ? 0 : Math.cos(t * 0.33 + i * 0.9) * 1.4;
        const tw = reduce ? 1 : 0.55 + 0.45 * Math.sin(t * 1.1 + i);
        el.style.transform = `translate(${s.x + dx + mx * 4}vmin, ${s.y + dy + my * 4}vmin)`;
        el.style.opacity = String(boot * 0.5 * tw);
      });

      // ── focus dynamics ──
      const focusPhase = smoothstep(1.55, 1.95, p);
      const focusFloat = p - 2;                       // app0 centers at p=2
      const activeIdx = clamp(Math.round(focusFloat), 0, APPS.length - 1);

      NODE_POS.forEach((_, i) => {
        const start = i * 0.08;
        const reveal = smoothstep(start, start + 0.55, boot);
        const emph = smooth(clamp(1 - Math.abs(focusFloat - i), 0, 1));
        const e = emph * focusPhase;

        // ── orbital position ──
        // angle advances with scroll progress → the whole ring of nodes rotates
        // around the core. Radius is scaled by `reveal` so nodes emerge OUT of
        // the orb as the network boots, then settle onto the orbit path.
        const angle = FOCAL_ANGLE + (i - focusFloat) * SLOT;
        const ca = Math.cos(angle), sa = Math.sin(angle);
        const driftX = reduce ? 0 : Math.sin(t * 0.5 + i * 1.7) * 0.3;
        const driftY = reduce ? 0 : Math.cos(t * 0.45 + i * 2.1) * 0.3;
        const nx = ca * ORBIT_RX * reveal + driftX + mx * 6;
        const ny = sa * ORBIT_RY * reveal + driftY + my * 6;

        // elliptical depth: front of the ellipse (sa > 0) reads closer →
        // slightly larger & brighter; the back reads farther → smaller & dimmer
        const depth = sa;                                  // -1 back … +1 front
        const front = depth * 0.5 + 0.5;                   //  0 back …  1 front
        const depthScale = 1 + depth * 0.14;
        const depthDim = 0.5 + 0.5 * front;                // 0.5 … 1
        const focusDim = lerp(1, 0.28 + 0.72 * emph, focusPhase);
        const dim = focusDim * lerp(1, depthDim, boot);

        const wrapEl = nodeWrapRefs.current[i];
        const chip = nodeChipRefs.current[i];
        const label = nodeLabelRefs.current[i];
        const outerLeft = nx < 0;

        if (wrapEl) {
          wrapEl.style.opacity = String(reveal * dim);
          wrapEl.style.transform = `translate(-50%, -50%) translate(${nx}vmin, ${ny}vmin)`;
          wrapEl.style.flexDirection = outerLeft ? 'row' : 'row-reverse';
          wrapEl.style.zIndex = String(Math.round(10 + depth * 5));
        }
        if (chip) {
          const pulse = reduce ? 0 : Math.sin(t * 1.4 + i) * 0.5 + 0.5; // 0..1
          chip.style.transform = `scale(${depthScale * (1 + 0.34 * e)})`;
          chip.style.boxShadow =
            `0 0 ${12 + 38 * e + pulse * 6 * reveal}px rgba(${ACCENT_HI},${0.2 + 0.55 * e}), ` +
            `inset 0 0 ${6 + 14 * e}px rgba(${ACCENT_SOFT},${0.1 + 0.35 * e})`;
          chip.style.borderColor = `rgba(${ACCENT_SOFT},${0.32 + 0.6 * e})`;
          chip.style.color = `rgba(${e > 0.4 ? ACCENT_SOFT : ACCENT},${0.7 + 0.3 * e})`;
        }
        if (label) {
          label.style.textAlign = outerLeft ? 'left' : 'right';
          const ls = lerp(0.7, 0.1 + 0.9 * emph, focusPhase);
          label.style.opacity = String(reveal * ls * lerp(1, depthDim, boot));
        }

        // connector + energy-pulse endpoints follow the orbiting node
        const x2 = `calc(50% + ${nx}vmin)`;
        const y2 = `calc(50% + ${ny}vmin)`;
        const conn = connRefs.current[i];
        if (conn) {
          conn.setAttribute('x2', x2);
          conn.setAttribute('y2', y2);
          conn.style.strokeDashoffset = String(1 - reveal);
          conn.style.opacity = String(reveal * lerp(0.45, 0.14 + 0.62 * emph, focusPhase) * lerp(0.6, 1, front));
          conn.style.strokeWidth = String(lerp(0.7, 1.5, e));
          conn.style.stroke = `rgba(${e > 0.4 ? ACCENT_SOFT : ACCENT}, 0.9)`;
        }
        const flow = flowRefs.current[i];
        if (flow) {
          flow.setAttribute('x2', x2);
          flow.setAttribute('y2', y2);
          flow.style.opacity = String(reveal * (0.25 + 0.75 * e) * lerp(0.6, 1, front));
          flow.style.strokeWidth = String(lerp(1.2, 2.4, e));
        }
      });

      // ── ecosystem overview heading (0.9 .. 1.7) ──
      if (ecoHeadingRef.current) {
        const inV = smoothstep(0.9, 1.2, p);
        const outV = smoothstep(1.55, 1.9, p);
        const vis = inV * (1 - outV);
        ecoHeadingRef.current.style.opacity = String(vis);
        ecoHeadingRef.current.style.transform =
          `translate3d(-50%, ${(1 - inV) * 22}px, 0)`;
      }

      // ── constellation parallax drift ──
      if (constellationRef.current) {
        const float = reduce ? 0 : Math.sin(t * 0.5) * 4;
        constellationRef.current.style.transform =
          `translate3d(${mx * 12}px, ${my * 8 + float}px, 0)`;
      }

      // ── focus panel + number envelope ──
      const triangle = clamp(1 - Math.abs(focusFloat - activeIdx) * 2, 0, 1);
      const panelEnv = focusPhase * triangle;
      if (panelRef.current) panelRef.current.style.opacity = String(panelEnv);
      if (numberRef.current) numberRef.current.style.opacity = String(panelEnv);

      const nextActive = focusPhase > 0.05 ? activeIdx : -1;
      if (nextActive !== lastActive) {
        lastActive = nextActive;
        activeRef.current = nextActive;
        setActive(nextActive);
      }

      raf = requestAnimationFrame(frame);
    };

    readScroll();
    raf = requestAnimationFrame(frame);
    window.addEventListener('scroll', readScroll, { passive: true });
    window.addEventListener('resize', readScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', readScroll);
      window.removeEventListener('resize', readScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // ── Mouse parallax (eased) ──────────────────────────────────────────────
  useEffect(() => {
    let raf = null;
    const onMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const tick = () => {
      const m = mouseRef.current;
      m.mx += (m.x - m.mx) * 0.05;
      m.my += (m.y - m.my) * 0.05;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener('mousemove', onMove); if (raf) cancelAnimationFrame(raf); };
  }, []);

  const activeApp = active >= 0 ? APPS[active] : null;
  const panelRight = active % 2 === 0; // even → panel right, number left
  const numLabel = active >= 0 ? String(active + 1).padStart(2, '0') : '00';

  return (
    <section
      id="hero"
      ref={wrapRef}
      aria-label="BauHub ecosystem"
      style={{ position: 'relative', height: `${STAGE_COUNT * 100}vh`, width: '100%' }}
    >
      <span id="apps" style={{ position: 'absolute', top: '120vh', left: 0 }} />

      <div
        style={{
          position: 'sticky', top: 0, left: 0,
          width: '100%', height: '100vh',
          overflow: 'hidden', isolation: 'isolate',
        }}
      >
        {/* ── ambient halo behind the orb ── */}
        <div
          ref={haloRef}
          aria-hidden="true"
          style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '130vmin', height: '130vmin',
            opacity: 0, pointerEvents: 'none', zIndex: 0,
            willChange: 'transform, opacity',
          }}
        >
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(closest-side, rgba(${ACCENT},0.12) 0%, rgba(${ACCENT},0.03) 46%, transparent 74%)`,
            filter: 'blur(30px)',
          }} />
          <div style={{
            position: 'absolute', inset: '32%',
            background: `radial-gradient(closest-side, rgba(${ACCENT_HI},0.22) 0%, rgba(${ACCENT},0.06) 48%, transparent 76%)`,
            filter: 'blur(24px)',
          }} />
        </div>

        {/* ── orbital network ── */}
        <div
          ref={constellationRef}
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', willChange: 'transform' }}
        >
          {/* concentric elliptical orbit rings (axis-aligned, nodes ride these) */}
          {RINGS.map((ring, i) => {
            const w = 2 * ORBIT_RX * ring.m;
            const h = 2 * ORBIT_RY * ring.m;
            return (
              <div
                key={`ring${i}`}
                ref={(el) => (ringRefs.current[i] = el)}
                style={{
                  position: 'absolute', top: '50%', left: '50%',
                  width: `${w}vmin`, height: `${h}vmin`,
                  marginLeft: `${-w / 2}vmin`, marginTop: `${-h / 2}vmin`,
                  border: ring.main
                    ? `1px solid rgba(${ACCENT_HI},0.55)`
                    : `1px solid rgba(${ACCENT},0.42)`,
                  borderRadius: '50%',
                  opacity: 0,
                  boxShadow: ring.main
                    ? `0 0 22px rgba(${ACCENT},0.16), inset 0 0 26px rgba(${ACCENT},0.05)`
                    : 'none',
                  transform: 'translate(-50%, -50%) scale(0.55)',
                  willChange: 'transform, opacity',
                }}
              />
            );
          })}

          {/* connector filaments + energy pulses + soft hub flare */}
          <ConnectorsSVG connRefs={connRefs} flowRefs={flowRefs} />

          {/* ambient sparks */}
          {SPARKS.map((s, i) => (
            <span
              key={`sp${i}`}
              ref={(el) => (sparkRefs.current[i] = el)}
              style={{
                position: 'absolute', top: '50%', left: '50%',
                width: s.s * 2, height: s.s * 2,
                marginLeft: -s.s, marginTop: -s.s,
                borderRadius: '50%',
                background: `rgba(${ACCENT_SOFT},0.8)`,
                boxShadow: `0 0 6px rgba(${ACCENT},0.6)`,
                transform: `translate(${s.x}vmin, ${s.y}vmin)`,
                opacity: 0,
                willChange: 'transform, opacity',
              }}
            />
          ))}

          {/* app nodes */}
          {APPS.map((app, i) => {
            const pos = NODE_POS[i];
            const labelLeft = pos.x < 0;
            return (
              <div
                key={app.id}
                ref={(el) => (nodeWrapRefs.current[i] = el)}
                style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: `translate(-50%, -50%) translate(${pos.x}vmin, ${pos.y}vmin)`,
                  display: 'flex', alignItems: 'center', gap: 12,
                  flexDirection: labelLeft ? 'row' : 'row-reverse',
                  pointerEvents: 'none', zIndex: 4, opacity: 0,
                  willChange: 'opacity, transform',
                }}
              >
                <NodeChip
                  initial={app.initial}
                  chipRef={(el) => (nodeChipRefs.current[i] = el)}
                  haloRef={(el) => (nodeHaloRefs.current[i] = el)}
                />
                <NodeLabel
                  app={app}
                  lang={lang}
                  labelLeft={labelLeft}
                  labelRef={(el) => (nodeLabelRefs.current[i] = el)}
                />
              </div>
            );
          })}
        </div>

        {/* ── central orb (the core) ── */}
        <div
          ref={orbRef}
          aria-hidden="true"
          style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 'clamp(240px, 34vmin, 420px)',
            height: 'clamp(240px, 34vmin, 420px)',
            transform: 'translate(-50%, -50%)',
            zIndex: 2, pointerEvents: 'none', opacity: 0,
            willChange: 'transform, opacity',
          }}
        >
          <OrbCore />
        </div>

        {/* ── intro content ── */}
        <div
          ref={introRef}
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: 'clamp(120px, 18vh, 220px) 24px clamp(40px, 6vh, 80px)',
            zIndex: 3, textAlign: 'center',
            willChange: 'transform, opacity',
          }}
        >
          <div
            ref={eyebrowRef}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '6px 15px', borderRadius: 999,
              background: `rgba(${ACCENT},0.05)`,
              border: `1px solid rgba(${ACCENT},0.2)`,
              backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
              fontFamily: 'var(--mono)', fontSize: 10.5,
              letterSpacing: '0.28em', color: 'var(--accent-hi)',
              marginBottom: 26, opacity: 0,
            }}
          >
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--accent-hi)',
              boxShadow: `0 0 10px rgba(${ACCENT_HI},0.9)`,
              animation: 'orb-glow-pulse 2.6s ease-in-out infinite',
            }} />
            {copy.heroLabel}
          </div>

          <h1
            aria-label="BauHub"
            style={{
              display: 'inline-flex', margin: 0,
              fontFamily: 'var(--display)', fontWeight: 800,
              fontSize: 'clamp(62px, 13vw, 188px)',
              lineHeight: 0.86, letterSpacing: '-0.055em',
            }}
          >
            {WORD.split('').map((ch, i) => (
              <span
                key={i}
                ref={(el) => (letterRefs.current[i] = el)}
                style={{
                  display: 'inline-block',
                  background: 'linear-gradient(180deg, #FFFFFF 0%, #CFE7F7 42%, #56B6FF 100%)',
                  WebkitBackgroundClip: 'text', backgroundClip: 'text',
                  color: 'transparent', WebkitTextFillColor: 'transparent',
                  filter: `drop-shadow(0 8px 60px rgba(${ACCENT},0.4))`,
                  willChange: 'transform, opacity, filter',
                }}
              >
                {ch}
              </span>
            ))}
          </h1>

          <div
            ref={metaRef}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 12,
              marginTop: 16, fontFamily: 'var(--mono)', fontSize: 10,
              letterSpacing: '0.3em', color: 'var(--ink3)',
              textTransform: 'uppercase', opacity: 0,
            }}
          >
            <span>v.2026</span>
            <span style={{ opacity: 0.4 }}>—</span>
            <span style={{ color: 'var(--accent-hi)' }}>EDICIÓN ATLAS</span>
            <span style={{ opacity: 0.4 }}>—</span>
            <span>06 APPS</span>
          </div>

          <div
            ref={ruleRef}
            aria-hidden="true"
            style={{
              marginTop: 16, width: 'min(380px, 56vw)', height: 1,
              transformOrigin: 'center',
              background: `linear-gradient(to right, transparent, rgba(${ACCENT_HI},0.7), transparent)`,
              opacity: 0,
            }}
          />

          <h2
            ref={taglineRef}
            style={{
              marginTop: 30, fontFamily: 'var(--display)', fontWeight: 500,
              fontSize: 'clamp(19px, 2.3vw, 27px)', lineHeight: 1.25,
              letterSpacing: '-0.01em', color: 'var(--ink)',
              maxWidth: 740, opacity: 0, willChange: 'transform, opacity',
            }}
          >
            {copy.manifesto}
          </h2>

          <p
            ref={subRef}
            style={{
              marginTop: 14, fontSize: 'clamp(14px, 1.4vw, 16px)',
              color: 'var(--ink2)', maxWidth: 540, lineHeight: 1.6, opacity: 0,
            }}
          >
            {copy.subhead}
          </p>

          <div
            ref={sigRef}
            style={{
              marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 12,
              fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.2em',
              color: 'var(--ink3)', textTransform: 'uppercase', opacity: 0,
            }}
          >
            <span style={{ width: 26, height: 1, background: `linear-gradient(to right, transparent, rgba(${ACCENT},0.6))` }} />
            {copy.bySignature}
            <span style={{ width: 26, height: 1, background: `linear-gradient(to left, transparent, rgba(${ACCENT},0.6))` }} />
          </div>

          <div
            ref={ctaRef}
            style={{ marginTop: 30, display: 'inline-flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}
          >
            <HeroBtn href="#apps" primary>{copy.exploreApps}</HeroBtn>
            <HeroBtn href="#contact">{copy.contactMe}</HeroBtn>
          </div>
        </div>

        {/* ── ecosystem overview heading ── */}
        <div
          ref={ecoHeadingRef}
          style={{
            position: 'absolute', left: '50%', bottom: 'clamp(72px, 12vh, 130px)',
            transform: 'translateX(-50%)', zIndex: 3, textAlign: 'center',
            pointerEvents: 'none', opacity: 0, willChange: 'transform, opacity',
          }}
        >
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.36em',
            color: 'var(--accent-hi)', marginBottom: 14,
          }}>
            {copy.ecosystemLabel}
          </div>
          <h2 style={{
            fontFamily: 'var(--display)', fontWeight: 700,
            fontSize: 'clamp(28px, 4vw, 52px)', letterSpacing: '-0.02em',
            color: 'var(--ink)', lineHeight: 1.05,
          }}>
            {copy.ecosystemHeading}
          </h2>
          <p style={{
            marginTop: 12, fontSize: 'clamp(13px, 1.4vw, 16px)',
            color: 'var(--ink2)', maxWidth: 500, margin: '12px auto 0',
          }}>
            {copy.ecosystemSub}
          </p>
        </div>

        {/* ── focused app panel ── */}
        {activeApp && (
          <FocusedAppPanel
            key={activeApp.id}
            app={activeApp}
            lang={lang}
            copy={copy}
            numLabel={numLabel}
            panelRight={panelRight}
            panelRef={panelRef}
            numberRef={numberRef}
          />
        )}

        {/* ── scroll hint ── */}
        <div
          ref={scrollHintRef}
          aria-hidden="true"
          style={{
            position: 'absolute', bottom: 26, left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            zIndex: 3, opacity: 0, pointerEvents: 'none',
          }}
        >
          <div style={{
            width: 1, height: 42,
            background: `linear-gradient(to bottom, transparent, rgba(${ACCENT_HI},0.7))`,
            animation: 'scroll-line 2.6s ease-in-out infinite',
          }} />
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 3, color: 'var(--ink3)',
          }}>
            {copy.scrollHint.toUpperCase()}
          </span>
        </div>

        <ProgressDots active={active} count={APPS.length} />
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */

function NodeChip({ initial, chipRef, haloRef }) {
  return (
    <div style={{ position: 'relative', width: 44, height: 44 }}>
      {/* animejs-driven sonar halo */}
      <div
        ref={haloRef}
        aria-hidden="true"
        style={{
          position: 'absolute', inset: -6, borderRadius: '50%',
          border: `1px solid rgba(${ACCENT_HI},0.6)`,
          opacity: 0, pointerEvents: 'none', willChange: 'transform, opacity',
        }}
      />
      <div
        ref={chipRef}
        style={{
          width: 44, height: 44, borderRadius: '50%',
          display: 'grid', placeItems: 'center',
          background: `radial-gradient(circle at 38% 32%, rgba(${ACCENT},0.18), rgba(7,16,24,0.92) 72%)`,
          border: `1px solid rgba(${ACCENT_SOFT},0.4)`,
          boxShadow: `0 0 12px rgba(${ACCENT_HI},0.22), inset 0 0 6px rgba(${ACCENT_SOFT},0.1)`,
          color: `rgba(${ACCENT},0.85)`,
          fontFamily: 'var(--display)', fontWeight: 700, fontSize: 16,
          letterSpacing: '-0.02em',
          willChange: 'transform',
        }}
      >
        {initial}
      </div>
    </div>
  );
}

function NodeLabel({ app, lang, labelLeft, labelRef }) {
  return (
    <div
      ref={labelRef}
      className="node-label"
      style={{
        textAlign: labelLeft ? 'left' : 'right',
        fontFamily: 'var(--display)', whiteSpace: 'nowrap', opacity: 0,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em', color: 'var(--ink)' }}>
        {app.name}
      </div>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '0.22em',
        color: 'var(--ink3)', textTransform: 'uppercase', marginTop: 3,
      }}>
        {app[lang].short}
      </div>
    </div>
  );
}

function OrbCore() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', animation: 'orb-float 7.2s ease-in-out infinite' }}>
      <div aria-hidden="true" style={{
        position: 'absolute', inset: '-26%', borderRadius: '50%',
        background: `radial-gradient(circle, rgba(${ACCENT},0.3) 0%, rgba(14,59,102,0.1) 40%, transparent 70%)`,
        filter: 'blur(36px)',
        animation: 'orb-glow-pulse 4.6s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: [
          'radial-gradient(circle at 34% 28%,',
          '  #7FD2FF 0%,',
          '  #56B6FF 9%,',
          '  #2F80ED 24%,',
          '  #14406E 48%,',
          '  #0A1F38 74%,',
          '  #050B14 100%)',
        ].join(' '),
        boxShadow: [
          'inset -26px -34px 70px rgba(0,0,0,0.9)',
          'inset 10px 12px 36px rgba(86,182,255,0.16)',
          '0 0 50px rgba(47,128,237,0.32)',
          '0 0 130px rgba(14,59,102,0.34)',
        ].join(', '),
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: `radial-gradient(circle at 50% 50%, transparent 63%, rgba(${ACCENT_HI},0.22) 71%, transparent 80%)`,
        mixBlendMode: 'screen', pointerEvents: 'none',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', top: '15%', left: '24%', width: '26%', height: '17%',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(220,240,255,0.5) 0%, transparent 100%)',
        filter: 'blur(6px)', pointerEvents: 'none',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        boxShadow: 'inset 0 0 80px rgba(5,11,20,0.65)', pointerEvents: 'none',
      }} />
    </div>
  );
}

function ConnectorsSVG({ connRefs, flowRefs }) {
  return (
    <svg
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}
    >
      <defs>
        <filter id="connGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.1" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="hubFlare" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={`rgba(${ACCENT},0.3)`} />
          <stop offset="60%" stopColor={`rgba(${ACCENT},0.04)`} />
          <stop offset="100%" stopColor={`rgba(${ACCENT},0)`} />
        </radialGradient>
      </defs>

      <circle cx="50%" cy="50%" r="9vmin" fill="url(#hubFlare)" />

      {/* base filaments (draw-in via strokeDashoffset, endpoints tracked by loop) */}
      {NODE_POS.map((p, i) => (
        <line
          key={`conn${i}`}
          ref={(el) => (connRefs.current[i] = el)}
          pathLength="1"
          x1="50%"
          y1="50%"
          x2={`calc(50% + ${p.x}vmin)`}
          y2={`calc(50% + ${p.y}vmin)`}
          stroke={`rgba(${ACCENT},0.9)`}
          strokeWidth="0.7"
          strokeDasharray="1"
          strokeDashoffset="1"
          opacity="0"
          filter="url(#connGlow)"
          style={{ willChange: 'stroke-dashoffset, opacity' }}
        />
      ))}

      {/* travelling energy pulses (short dash, animejs-driven strokeDashoffset) */}
      {NODE_POS.map((p, i) => (
        <line
          key={`flow${i}`}
          ref={(el) => (flowRefs.current[i] = el)}
          pathLength="1"
          x1="50%"
          y1="50%"
          x2={`calc(50% + ${p.x}vmin)`}
          y2={`calc(50% + ${p.y}vmin)`}
          stroke={`rgba(${ACCENT_SOFT},0.95)`}
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeDasharray="0.12 0.88"
          strokeDashoffset="1"
          opacity="0"
          filter="url(#connGlow)"
          style={{ willChange: 'stroke-dashoffset, opacity' }}
        />
      ))}
    </svg>
  );
}

const panelContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};
const panelItem = {
  hidden: { opacity: 0, y: 22, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.16, 0.84, 0.36, 1] } },
};

function FocusedAppPanel({ app, lang, copy, numLabel, panelRight, panelRef, numberRef }) {
  const t = app[lang];
  return (
    <div
      className="focus-grid"
      style={{
        position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
        display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center',
        padding: 'clamp(90px, 12vh, 140px) clamp(28px, 6vw, 96px)',
      }}
    >
      {/* outlined chapter number — opposite side from the panel */}
      <div
        ref={numberRef}
        aria-hidden="true"
        className="focus-num"
        style={{
          gridColumn: panelRight ? 1 : 2, gridRow: 1,
          justifySelf: panelRight ? 'start' : 'end',
          fontFamily: 'var(--display)', fontWeight: 800,
          fontSize: 'clamp(120px, 20vw, 300px)', lineHeight: 0.82,
          letterSpacing: '-0.06em', color: 'transparent',
          WebkitTextStroke: `1.2px rgba(${ACCENT},0.4)`,
          textShadow: `0 0 70px rgba(${ACCENT},0.22)`,
          userSelect: 'none', opacity: 0,
          animation: 'num-rise 0.8s cubic-bezier(.16,.84,.36,1) both',
        }}
      >
        {numLabel}
      </div>

      {/* panel — outer opacity is scroll-scrubbed (panelRef); inner content
          entrance is framer-motion, re-running on each app via React key */}
      <div
        ref={panelRef}
        className="focus-panel"
        style={{
          gridColumn: panelRight ? 2 : 1, gridRow: 1,
          justifySelf: panelRight ? 'end' : 'start',
          maxWidth: 440, textAlign: 'left', pointerEvents: 'auto', opacity: 0,
        }}
      >
        <motion.div variants={panelContainer} initial="hidden" animate="show">
          <motion.div variants={panelItem} style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.36em',
            color: 'var(--accent-hi)', textTransform: 'uppercase', marginBottom: 18,
          }}>
            <span style={{ width: 28, height: 1, background: 'var(--accent-hi)', opacity: 0.6 }} />
            {t.tag}
          </motion.div>

          <motion.h3 variants={panelItem} style={{
            fontFamily: 'var(--display)', fontWeight: 800,
            fontSize: 'clamp(42px, 5.4vw, 74px)', lineHeight: 0.98,
            letterSpacing: '-0.035em', color: 'var(--ink)',
            textShadow: `0 0 42px rgba(${ACCENT},0.32)`,
          }}>
            {app.name}
          </motion.h3>

          <motion.p variants={panelItem} style={{
            marginTop: 18, fontSize: 'clamp(15px, 1.35vw, 17px)',
            color: 'var(--ink2)', lineHeight: 1.65, maxWidth: 410,
          }}>
            {t.desc}
          </motion.p>

          <motion.div variants={panelItem} style={{ marginTop: 26 }}>
            <motion.a
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -2, scale: 1.025 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 380, damping: 24 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '13px 26px', borderRadius: 999,
                fontSize: 14, fontWeight: 600, color: '#04101F',
                background: 'linear-gradient(135deg, #2F80ED 0%, #56B6FF 100%)',
                border: '1px solid rgba(255,255,255,0.4)',
                boxShadow: `0 8px 30px rgba(${ACCENT},0.4), inset 0 1px 0 rgba(255,255,255,0.4)`,
              }}
            >
              {copy.openApp}
              <span style={{ fontSize: 16 }}>→</span>
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function ProgressDots({ active, count }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column', gap: 13, zIndex: 4, pointerEvents: 'none',
      }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const isActive = active === i;
        return (
          <div
            key={i}
            style={{
              width: isActive ? 10 : 6, height: isActive ? 10 : 6,
              borderRadius: '50%',
              border: `1px solid rgba(${ACCENT},0.5)`,
              background: isActive ? 'var(--accent-hi)' : 'transparent',
              boxShadow: isActive ? `0 0 12px rgba(${ACCENT_HI},0.8)` : 'none',
              transition: 'all 0.4s cubic-bezier(.16,.84,.36,1)',
            }}
          />
        );
      })}
    </div>
  );
}

function HeroBtn({ href, children, primary = false }) {
  return (
    <a
      href={href}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '14px 30px', borderRadius: 999,
        fontSize: 14.5, fontWeight: 600, letterSpacing: '0.02em', textDecoration: 'none',
        background: primary
          ? 'linear-gradient(135deg, #2F80ED 0%, #56B6FF 100%)'
          : 'rgba(255,255,255,0.03)',
        color: primary ? '#04101F' : 'var(--ink)',
        border: primary ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.14)',
        backdropFilter: primary ? 'none' : 'blur(10px)',
        WebkitBackdropFilter: primary ? 'none' : 'blur(10px)',
        boxShadow: primary
          ? `0 8px 30px rgba(${ACCENT},0.4), inset 0 1px 0 rgba(255,255,255,0.4)`
          : '0 4px 18px rgba(0,0,0,0.3)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease, border-color 0.25s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px) scale(1.025)';
        if (primary) {
          e.currentTarget.style.boxShadow = `0 14px 46px rgba(${ACCENT_HI},0.55), inset 0 1px 0 rgba(255,255,255,0.5)`;
        } else {
          e.currentTarget.style.borderColor = `rgba(${ACCENT},0.5)`;
          e.currentTarget.style.background = `rgba(${ACCENT},0.07)`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        if (primary) {
          e.currentTarget.style.boxShadow = `0 8px 30px rgba(${ACCENT},0.4), inset 0 1px 0 rgba(255,255,255,0.4)`;
        } else {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
        }
      }}
    >
      {children}
      {primary && <span style={{ fontSize: 16, marginLeft: 2 }}>→</span>}
    </a>
  );
}
