import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, createTimeline, utils, stagger } from 'animejs';
import { APPS } from '../data.js';

/**
 * EcosystemHero
 *
 * Sticky scroll-driven stage. The orb is the core of the system. On scroll,
 * the network EMANATES from the orb — radial spokes draw outward, then app
 * nodes ignite, then the outer mesh fills in. Palette is deep electric blue
 * on near-black, not bright aqua.
 *
 *  0  intro              — orb dominant, network hidden
 *  1  ecosystem reveal   — lines draw out from orb, nodes light up
 *  2..7 each app focused — active node lit, panel + number per chapter
 */

const STAGE_COUNT = 8;

// Irregular constellation positions, in vmin from the visual center.
// Pushed outward so the network spans a large portion of the viewport.
const NODE_POS = [
  { x: -44, y: -28 }, // 0  Techasset      (upper-left)
  { x:  42, y: -32 }, // 1  Horaria         (upper-right)
  { x: -54, y:   4 }, // 2  Checkinout      (far-left)
  { x:  52, y:  12 }, // 3  NexoEscolar     (far-right)
  { x: -30, y:  34 }, // 4  Fuga$           (lower-left)
  { x:  40, y:  32 }, // 5  Typely          (lower-right)
];

// Inner structural waypoint nodes — unlabeled hubs that lines pass through.
// They build the layered "digital map" feel without competing with app nodes.
const INNER_POS = [
  { x:   0, y: -16 }, // top
  { x: -22, y:  -4 }, // mid-left
  { x:  22, y:  -2 }, // mid-right
  { x:  -8, y:  16 }, // lower-left
  { x:  12, y:  18 }, // lower-right
  { x:   0, y:   0 }, // dead-center (the hub)
];

// App-node mesh + cross-center diagonals so the middle reads as connected.
const NODE_EDGES = [
  [0, 1], [0, 2], [1, 3],
  [2, 3], [2, 4], [3, 5],
  [4, 5], [1, 2], [0, 3],
  [0, 5], [1, 4], [2, 5], [3, 4], // cross-center diagonals
];

// Connections from each app node to the inner structural waypoints — creates
// the dense central web. The center hub (index 5) connects to everything.
const INNER_EDGES = [
  // every app node → center hub (creates the radial spine)
  [0, 5], [1, 5], [2, 5], [3, 5], [4, 5], [5, 5],
  // app → inner waypoint mappings (creates depth + crossings)
  [0, 0], [0, 1], [1, 0], [1, 2],
  [2, 1], [2, 3], [3, 2], [3, 4],
  [4, 3], [5, 4],
];

// Mesh between inner waypoints themselves — webs the middle.
const INNER_INNER_EDGES = [
  [0, 1], [0, 2], [1, 2],
  [1, 3], [2, 4], [3, 4],
  [0, 5], [1, 5], [2, 5], [3, 5], [4, 5],
];

// Concentric ring scaffolding (radii in vmin) — depth + structure.
const RINGS = [
  { r: 14, op: 0.22, dash: '2 5' },
  { r: 26, op: 0.16, dash: '3 8' },
  { r: 40, op: 0.10, dash: '5 11' },
];

// Backdrop accent stars — more of them, spread broadly.
const ACCENT_DOTS = [
  { x: -10, y: -38, s: 1.8 }, { x:  14, y: -34, s: 1.4 }, { x:  46, y: -14, s: 1.2 },
  { x: -50, y: -10, s: 1.6 }, { x:  -8, y:  38, s: 1.4 }, { x:  18, y:  36, s: 1.2 },
  { x: -36, y:  20, s: 1.2 }, { x:  44, y: -24, s: 1.4 }, { x:  -2, y: -20, s: 1.0 },
  { x:   8, y:  10, s: 1.0 }, { x: -18, y:  -8, s: 1.0 }, { x:  24, y:  -4, s: 1.0 },
  { x: -28, y:  -22, s: 1.2 },{ x:  30, y: -16, s: 1.2 }, { x: -42, y:  28, s: 1.2 },
  { x:  36, y:  20, s: 1.2 }, { x:  -6, y:   2, s: 0.9 }, { x:   4, y:  -8, s: 0.9 },
  { x:  14, y:   6, s: 0.9 }, { x: -14, y:   4, s: 0.9 }, { x:   0, y: -28, s: 1.0 },
  { x:   0, y:  28, s: 1.0 }, { x: -56, y:  20, s: 0.9 }, { x:  56, y: -8,  s: 0.9 },
  { x: -38, y: -36, s: 1.1 }, { x:  36, y:  40, s: 1.1 }, { x: -20, y:  44, s: 1.0 },
  { x:  22, y: -42, s: 1.0 }, { x: -50, y:  38, s: 0.9 }, { x:  48, y:  28, s: 0.9 },
];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (t) => t * t * (3 - 2 * t);

export default function EcosystemHero({ copy, lang }) {
  const wrapRef = useRef(null);
  const stageRef = useRef(null);
  const haloRef = useRef(null);
  const gridRef = useRef(null);
  const constellationRef = useRef(null);
  const wordmarkBlockRef = useRef(null);
  const wordmarkRef = useRef(null);
  const wordmarkGhostRef = useRef(null);
  const letterRefs = useRef([]);
  const taglineRef = useRef(null);
  const subRef = useRef(null);
  const sigRef = useRef(null);
  const ctaRef = useRef(null);
  const scrollHintRef = useRef(null);
  const ecoHeadingRef = useRef(null);
  const ecoSubRef = useRef(null);
  const panelRef = useRef(null);
  const numberRef = useRef(null);
  const orbRef = useRef(null);
  const edgeRefs = useRef([]);
  const centerEdgeRefs = useRef([]);
  const innerEdgeRefs = useRef([]);
  const innerInnerEdgeRefs = useRef([]);
  const ringRefs = useRef([]);
  const innerNodeRefs = useRef([]);
  const centerHubRef = useRef(null);
  const nodeRefs = useRef([]);
  const dotRefs = useRef([]);

  const [active, setActive] = useState(-1);
  const activeRef = useRef(-1);
  const introDoneRef = useRef(false);
  const mouseRef = useRef({ x: 0, y: 0, mx: 0, my: 0 });

  const WORD = 'BauHub';

  // ── Intro animation (anime.js) ──────────────────────────────────────────
  useLayoutEffect(() => {
    // Initial hidden state for everything that fades in during intro.
    utils.set(letterRefs.current.filter(Boolean), {
      opacity: 0,
      translateY: 80,
      filter: 'blur(12px)',
    });
    utils.set(
      [
        wordmarkGhostRef.current,
        taglineRef.current,
        subRef.current,
        sigRef.current,
        scrollHintRef.current,
        haloRef.current,
      ].filter(Boolean),
      { opacity: 0 }
    );
    if (ctaRef.current) {
      utils.set(Array.from(ctaRef.current.children), { opacity: 0, translateY: 16 });
    }
    // Orb starts hidden — it fades up first as the hero core.
    if (orbRef.current) utils.set(orbRef.current, { opacity: 0, scale: 0.85 });

    // Constellation pieces start invisible — they reveal during scroll.
    utils.set(
      [
        ...nodeRefs.current,
        ...innerNodeRefs.current,
        ...dotRefs.current,
        centerHubRef.current,
      ].filter(Boolean),
      { opacity: 0 }
    );
    // Lines get pathLength=1 in JSX so we can use dashoffset to draw them.
    // Setting dashoffset=1 hides them; anime later animates to 0 = drawn.
    const allLines = [
      ...edgeRefs.current,
      ...centerEdgeRefs.current,
      ...innerEdgeRefs.current,
      ...innerInnerEdgeRefs.current,
    ].filter(Boolean);
    utils.set(allLines, {
      strokeDasharray: '1',
      strokeDashoffset: 1,
      opacity: 0,
    });
    utils.set(ringRefs.current.filter(Boolean), { opacity: 0 });

    const tl = createTimeline({
      defaults: { ease: 'outExpo' },
      onComplete: () => { introDoneRef.current = true; },
    });

    tl.add(haloRef.current, { opacity: 1, duration: 1800, ease: 'outQuint' })
      .add(
        orbRef.current,
        { opacity: 1, scale: [0.85, 1], duration: 1600, ease: 'outQuint' },
        '-=1500'
      )
      .add(
        letterRefs.current.filter(Boolean),
        {
          opacity: 1,
          translateY: 0,
          filter: 'blur(0px)',
          duration: 1200,
          delay: stagger(70, { start: -400 }),
        },
        '-=1400'
      )
      .add(wordmarkGhostRef.current, { opacity: 1, duration: 1000 }, '-=800')
      .add(taglineRef.current, { opacity: 1, translateY: [22, 0], duration: 900 }, '-=700')
      .add(subRef.current, { opacity: 1, translateY: [16, 0], duration: 800 }, '-=650')
      .add(sigRef.current, { opacity: 1, translateY: [14, 0], duration: 700 }, '-=600')
      .add(
        Array.from(ctaRef.current?.children ?? []),
        { opacity: 1, translateY: [16, 0], duration: 700, delay: stagger(90) },
        '-=550'
      )
      .add(scrollHintRef.current, { opacity: 0.55, duration: 600 }, '-=300');

    const safety = setTimeout(() => { introDoneRef.current = true; }, 6000);
    return () => {
      tl.pause();
      clearTimeout(safety);
    };
  }, []);

  // ── Scroll-driven stage interpolation ───────────────────────────────────
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    let raf = null;
    let lastActive = -1;
    let edgesRevealed = false;

    const revealEdges = () => {
      if (edgesRevealed) return;
      edgesRevealed = true;

      // 1. Concentric scaffolding rings — soft halo of order.
      animate(ringRefs.current.filter(Boolean), {
        opacity: (_, i) => [0, RINGS[i]?.op ?? 0.2],
        duration: 1400,
        ease: 'outExpo',
        delay: stagger(120),
      });

      // 2. Radial spokes — DRAW OUTWARD FROM THE ORB to each app node.
      animate(centerEdgeRefs.current.filter(Boolean), {
        opacity: [0, 0.75],
        strokeDashoffset: [1, 0],
        duration: 1300,
        ease: 'outExpo',
        delay: stagger(80, { start: 80 }),
      });

      // 3. Inner waypoint markers — appear along the path.
      animate(innerNodeRefs.current.filter(Boolean), {
        opacity: [0, 0.85],
        scale: [0.5, 1],
        duration: 700,
        ease: 'outBack',
        delay: stagger(50, { start: 500 }),
      });

      // 4. Inner waypoint mesh — light webbing near the orb.
      animate(innerInnerEdgeRefs.current.filter(Boolean), {
        opacity: [0, 0.35],
        strokeDashoffset: [1, 0],
        duration: 900,
        ease: 'outExpo',
        delay: stagger(35, { start: 600 }),
      });

      // 5. Inner edges (waypoint → app) — extending outward through the web.
      animate(innerEdgeRefs.current.filter(Boolean), {
        opacity: [0, 0.45],
        strokeDashoffset: [1, 0],
        duration: 1100,
        ease: 'outExpo',
        delay: stagger(35, { start: 700 }),
      });

      // 6. App nodes — ignite as the lines reach them.
      animate(nodeRefs.current.filter(Boolean), {
        opacity: [0, 1],
        scale: [0.6, 1],
        duration: 900,
        ease: 'outBack',
        delay: stagger(80, { start: 950 }),
      });

      // 7. Outer mesh — perimeter connections between app nodes.
      animate(edgeRefs.current.filter(Boolean), {
        opacity: [0, 0.40],
        strokeDashoffset: [1, 0],
        duration: 1100,
        ease: 'outExpo',
        delay: stagger(35, { start: 1100 }),
      });

      // 8. Backdrop stars — settle in.
      animate(dotRefs.current.filter(Boolean), {
        opacity: [0, 0.55],
        duration: 1400,
        ease: 'outQuint',
        delay: stagger(28, { start: 250 }),
      });
    };

    const applyScroll = () => {
      const rect = wrap.getBoundingClientRect();
      const vh = window.innerHeight;
      const totalScroll = (STAGE_COUNT - 1) * vh;
      const scrolled = clamp(-rect.top, 0, totalScroll);
      const progress = scrolled / vh; // 0..STAGE_COUNT-1

      // Trigger network reveal as soon as the user scrolls past the intro.
      if (progress > 0.06) revealEdges();

      // ── INTRO content fade (0→1) ──
      const introOut = clamp(progress, 0, 1);
      const introOpacity = 1 - smooth(introOut);
      if (introDoneRef.current) {
        if (wordmarkBlockRef.current) {
          wordmarkBlockRef.current.style.opacity = String(introOpacity);
          wordmarkBlockRef.current.style.transform =
            `translate3d(0, ${-introOut * 36}px, 0) scale(${1 - introOut * 0.06})`;
        }
        for (const ref of [taglineRef.current, subRef.current, sigRef.current, ctaRef.current]) {
          if (ref) ref.style.opacity = String(introOpacity);
        }
        if (scrollHintRef.current) {
          scrollHintRef.current.style.opacity = String(0.55 * (1 - introOut));
        }
      }

      // ── Network contrast strengthens through scroll ──
      // First screen: orb-only (intensity 0). Scroll: full intensity by 1.0.
      const netBoost = smooth(clamp(progress, 0, 1));
      if (constellationRef.current) {
        constellationRef.current.style.setProperty('--net-intensity', String(netBoost));
      }

      // ── HALO position / size — drifts up subtly with scroll ──
      if (haloRef.current && introDoneRef.current) {
        const haloY = -smooth(introOut) * 40;
        const haloScale = 1 + smooth(introOut) * 0.08;
        haloRef.current.style.transform =
          `translate(-50%, -50%) translate3d(${mouseRef.current.mx * 18}px, ${haloY + mouseRef.current.my * 12}px, 0) scale(${haloScale})`;
      }

      // ── ORB position — sits upper-center on intro, settles to mid on chapters
      if (orbRef.current && introDoneRef.current) {
        const settle = smooth(introOut); // 0 at intro → 1 at chapters
        const orbOffsetY = (1 - settle) * (-window.innerHeight * 0.14);
        const orbScale = 1 - settle * 0.08;
        orbRef.current.style.transform =
          `translate(-50%, -50%) translate3d(${mouseRef.current.mx * 10}px, ${orbOffsetY + mouseRef.current.my * 6}px, 0) scale(${orbScale})`;
      }

      // ── ECOSYSTEM heading visible roughly 0.5..1.6 ──
      const ecoIn = smooth(clamp(progress - 0.4, 0, 1));
      const ecoOut = smooth(clamp(progress - 1.4, 0, 1));
      const ecoVis = ecoIn * (1 - ecoOut);
      if (ecoHeadingRef.current) {
        ecoHeadingRef.current.style.opacity = String(ecoVis);
        ecoHeadingRef.current.style.transform =
          `translate3d(-50%, ${(1 - ecoIn) * 24}px, 0)`;
      }
      if (ecoSubRef.current) {
        ecoSubRef.current.style.opacity = String(ecoVis * 0.85);
      }

      // ── Constellation drift — gentle parallax, NO literal rotation ──
      // Translates the whole network in y as we move through chapters so the
      // active node settles near the centerline. No spin.
      if (constellationRef.current) {
        const driftY = -clamp(progress - 1, 0, 6) * 6; // up to -36px across chapters
        const driftX = mouseRef.current.mx * 12;
        constellationRef.current.style.setProperty('--drift-x', `${driftX}px`);
        constellationRef.current.style.setProperty('--drift-y', `${driftY + mouseRef.current.my * 8}px`);
      }

      // ── Grid backdrop subtle parallax ──
      if (gridRef.current) {
        const gp = clamp(progress, 0, 7) / 7;
        gridRef.current.style.opacity = String(0.35 + gp * 0.2);
      }

      // ── ACTIVE app index ──
      let nextActive = -1;
      if (progress >= 1.6) {
        nextActive = clamp(Math.round(progress - 2), 0, APPS.length - 1);
      }
      if (nextActive !== lastActive) {
        lastActive = nextActive;
        activeRef.current = nextActive;
        setActive(nextActive);
      }

      raf = null;
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(applyScroll);
    };

    applyScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // ── Mouse parallax (eased follow) ───────────────────────────────────────
  useEffect(() => {
    let raf = null;
    const onMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const tick = () => {
      const m = mouseRef.current;
      m.mx += (m.x - m.mx) * 0.06;
      m.my += (m.y - m.my) * 0.06;
      if (wordmarkRef.current) {
        wordmarkRef.current.style.transform =
          `translate3d(${m.mx * -6}px, ${m.my * -3}px, 0)`;
      }
      if (wordmarkGhostRef.current) {
        // Note: wordmarkGhostRef opacity is set by anime; we only touch transform here.
        wordmarkGhostRef.current.style.transform =
          `translate3d(${m.mx * 10}px, ${m.my * 5}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // ── Active node pulse + panel reveal (anime.js) ─────────────────────────
  useEffect(() => {
    if (active < 0) return;
    const node = nodeRefs.current[active];
    if (node) {
      animate(node, {
        scale: [0.92, 1.14, 1],
        duration: 900,
        ease: 'outElastic(1, .55)',
      });
    }
    if (panelRef.current) {
      animate(panelRef.current.querySelectorAll('[data-stagger]'), {
        opacity: [0, 1],
        translateY: [22, 0],
        delay: stagger(80),
        duration: 750,
        ease: 'outExpo',
      });
    }
    if (numberRef.current) {
      animate(numberRef.current, {
        opacity: [0, 1],
        translateY: [40, 0],
        duration: 900,
        ease: 'outExpo',
      });
    }
  }, [active]);

  const activeApp = active >= 0 ? APPS[active] : null;
  const panelRight = active % 2 === 0;
  const numLabel = active >= 0 ? String(active + 1).padStart(2, '0') : '00';

  return (
    <section
      id="hero"
      ref={wrapRef}
      aria-label="BauHub ecosystem"
      style={{
        position: 'relative',
        height: `${STAGE_COUNT * 100}vh`,
        width: '100%',
      }}
    >
      <span id="apps" style={{ position: 'absolute', top: '120vh', left: 0 }} />

      <div
        ref={stageRef}
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
          isolation: 'isolate',
        }}
      >
        {/* ── 1. Grid backdrop ────────────────────────────────────── */}
        <div
          ref={gridRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: [
              'linear-gradient(rgba(61,183,255,0.045) 1px, transparent 1px)',
              'linear-gradient(90deg, rgba(61,183,255,0.045) 1px, transparent 1px)',
            ].join(', '),
            backgroundSize: '64px 64px, 64px 64px',
            maskImage:
              'radial-gradient(ellipse 70% 60% at center, black 25%, transparent 80%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 70% 60% at center, black 25%, transparent 80%)',
            opacity: 0.35,
            pointerEvents: 'none',
            zIndex: 0,
            transition: 'opacity 0.6s ease',
          }}
        />

        {/* ── 2. Layered ambient halo (NOT a sphere) ──────────────── */}
        <div
          ref={haloRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '140vmin',
            height: '140vmin',
            opacity: 0,
            pointerEvents: 'none',
            zIndex: 0,
            willChange: 'transform, opacity',
          }}
        >
          {/* wide outer haze */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(closest-side, rgba(61,183,255,0.18) 0%, rgba(61,183,255,0.05) 45%, transparent 75%)',
            filter: 'blur(28px)',
          }} />
          {/* tight inner core glow */}
          <div style={{
            position: 'absolute',
            inset: '30%',
            background:
              'radial-gradient(closest-side, rgba(61,183,255,0.38) 0%, rgba(61,183,255,0.1) 45%, transparent 75%)',
            filter: 'blur(22px)',
          }} />
          {/* offset cyan accent for asymmetric depth */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 40% 30% at 38% 42%, rgba(122,241,255,0.22), transparent 70%)',
            filter: 'blur(30px)',
            mixBlendMode: 'screen',
          }} />
        </div>

        {/* ── 2b. CENTRAL ORB — the ecosystem core ─────────────────── */}
        <div
          ref={orbRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 'clamp(260px, 38vmin, 460px)',
            height: 'clamp(260px, 38vmin, 460px)',
            transform: 'translate(-50%, -50%)',
            zIndex: 2,
            pointerEvents: 'none',
            opacity: 0,
            willChange: 'transform, opacity',
          }}
        >
          <OrbCore />
        </div>

        {/* ── 3. Constellation network ────────────────────────────── */}
        <div
          ref={constellationRef}
          aria-hidden="true"
          className="eco-constellation"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            pointerEvents: 'none',
            transform:
              'translate3d(var(--drift-x, 0px), var(--drift-y, 0px), 0)',
            transition: 'transform 0.9s cubic-bezier(.16,.84,.36,1)',
            ['--net-intensity']: '0',
          }}
        >
          <ConstellationSVG
            edgeRefs={edgeRefs}
            centerEdgeRefs={centerEdgeRefs}
            innerEdgeRefs={innerEdgeRefs}
            innerInnerEdgeRefs={innerInnerEdgeRefs}
            ringRefs={ringRefs}
            active={active}
          />

          {/* Inner structural waypoint markers */}
          {INNER_POS.map((p, i) => (
            <span
              key={`in${i}`}
              ref={(el) => (innerNodeRefs.current[i] = el)}
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 6,
                height: 6,
                marginLeft: -3,
                marginTop: -3,
                background: 'rgba(61,183,255,0.7)',
                border: '1px solid rgba(180,247,255,0.7)',
                borderRadius: 2,
                boxShadow: '0 0 10px rgba(61,183,255,0.6)',
                transform: `translate(${p.x}vmin, ${p.y}vmin) rotate(45deg)`,
                opacity: 0,
                zIndex: 3,
              }}
            />
          ))}

          {/* Center wireframe hub */}
          <CenterHub innerRef={centerHubRef} />


          {/* accent dots (constellation backdrop) */}
          {ACCENT_DOTS.map((d, i) => (
            <span
              key={i}
              ref={(el) => (dotRefs.current[i] = el)}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: d.s * 2,
                height: d.s * 2,
                marginLeft: -d.s,
                marginTop: -d.s,
                borderRadius: '50%',
                background: 'rgba(61,183,255,0.85)',
                boxShadow: '0 0 6px rgba(61,183,255,0.7)',
                transform: `translate(${d.x}vmin, ${d.y}vmin)`,
                opacity: 0,
              }}
            />
          ))}

          {/* app nodes */}
          {APPS.map((app, i) => {
            const pos = NODE_POS[i];
            const isActive = active === i;
            const labelLeft = pos.x < 0;
            return (
              <div
                key={app.id}
                ref={(el) => (nodeRefs.current[i] = el)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) translate(${pos.x}vmin, ${pos.y}vmin)`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  flexDirection: labelLeft ? 'row' : 'row-reverse',
                  pointerEvents: 'none',
                  zIndex: 4,
                  opacity: 0,
                  willChange: 'transform, opacity',
                }}
              >
                <NodeChip initial={app.initial} active={isActive} />
                <NodeLabel app={app} lang={lang} labelLeft={labelLeft} active={isActive} />
              </div>
            );
          })}
        </div>

        {/* ── 4. INTRO content (the real hero) ────────────────────── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(140px, 22vh, 240px) 24px clamp(40px, 6vh, 80px)',
            zIndex: 3,
            pointerEvents: 'none',
            textAlign: 'center',
          }}
        >
          {/* eyebrow chip */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 14px',
              borderRadius: 999,
              background: 'rgba(61,183,255,0.06)',
              border: '1px solid rgba(61,183,255,0.22)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              fontFamily: 'var(--mono)',
              fontSize: 10.5,
              letterSpacing: '0.28em',
              color: 'var(--accent)',
              marginBottom: 28,
            }}
          >
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--accent)',
              boxShadow: '0 0 10px rgba(61,183,255,0.9)',
              animation: 'orb-glow-pulse 2.4s ease-in-out infinite',
            }} />
            {copy.heroLabel}
          </div>

          {/* WORDMARK BLOCK — letter-split for premium intro */}
          <div
            ref={wordmarkBlockRef}
            style={{
              position: 'relative',
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              willChange: 'transform, opacity',
            }}
          >
            <div style={{ position: 'relative', lineHeight: 0.86 }}>
              {/* ghost behind */}
              <span
                ref={wordmarkGhostRef}
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  fontFamily: 'var(--display)',
                  fontWeight: 800,
                  fontSize: 'clamp(64px, 14vw, 200px)',
                  lineHeight: 0.86,
                  letterSpacing: '-0.055em',
                  color: 'transparent',
                  WebkitTextStroke: '1px rgba(61,183,255,0.32)',
                  filter: 'blur(0.5px)',
                  pointerEvents: 'none',
                  opacity: 0,
                  willChange: 'transform, opacity',
                }}
              >
                BauHub
              </span>
              {/* main wordmark, per-letter for stagger */}
              <h1
                ref={wordmarkRef}
                aria-label="BauHub"
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  fontFamily: 'var(--display)',
                  fontWeight: 800,
                  fontSize: 'clamp(64px, 14vw, 200px)',
                  lineHeight: 0.86,
                  letterSpacing: '-0.055em',
                  margin: 0,
                  willChange: 'transform',
                }}
              >
                {WORD.split('').map((ch, i) => (
                  <span
                    key={i}
                    ref={(el) => (letterRefs.current[i] = el)}
                    style={{
                      display: 'inline-block',
                      background:
                        'linear-gradient(180deg, #ffffff 0%, #CFE7F7 45%, #3DB7FF 100%)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                      WebkitTextFillColor: 'transparent',
                      filter: 'drop-shadow(0 6px 70px rgba(61,183,255,0.45))',
                      willChange: 'transform, opacity, filter',
                    }}
                  >
                    {ch}
                  </span>
                ))}
              </h1>
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              marginTop: 14,
              fontFamily: 'var(--mono)',
              fontSize: 10,
              letterSpacing: '0.32em',
              color: 'var(--ink3)',
              textTransform: 'uppercase',
            }}>
              <span>v.2026</span>
              <span style={{ opacity: 0.4 }}>—</span>
              <span style={{ color: 'var(--accent)' }}>EDICIÓN ATLAS</span>
              <span style={{ opacity: 0.4 }}>—</span>
              <span>06 APPS</span>
            </div>

            <div
              aria-hidden="true"
              style={{
                marginTop: 14,
                width: 'min(420px, 60vw)',
                height: 1,
                background:
                  'linear-gradient(to right, transparent, rgba(61,183,255,0.85), transparent)',
                boxShadow: '0 0 14px rgba(61,183,255,0.5)',
              }}
            />
          </div>

          <h2
            ref={taglineRef}
            style={{
              opacity: 0,
              position: 'relative',
              marginTop: 36,
              fontFamily: 'var(--display)',
              fontWeight: 500,
              fontSize: 'clamp(20px, 2.4vw, 28px)',
              lineHeight: 1.25,
              letterSpacing: '-0.01em',
              color: 'var(--ink)',
              maxWidth: 760,
              willChange: 'transform, opacity',
            }}
          >
            {copy.manifesto}
          </h2>

          <p
            ref={subRef}
            style={{
              opacity: 0,
              marginTop: 14,
              fontSize: 'clamp(15px, 1.5vw, 17px)',
              color: 'var(--ink2)',
              maxWidth: 560,
              lineHeight: 1.6,
              willChange: 'opacity',
            }}
          >
            {copy.subhead}
          </p>

          <div
            ref={sigRef}
            style={{
              opacity: 0,
              marginTop: 20,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              fontFamily: 'var(--mono)',
              fontSize: 11.5,
              letterSpacing: '0.22em',
              color: 'var(--ink3)',
              textTransform: 'uppercase',
            }}
          >
            <span style={{ width: 28, height: 1, background: 'linear-gradient(to right, transparent, rgba(61,183,255,0.6))' }} />
            {copy.bySignature}
            <span style={{ width: 28, height: 1, background: 'linear-gradient(to left, transparent, rgba(61,183,255,0.6))' }} />
          </div>

          <div
            ref={ctaRef}
            style={{
              marginTop: 32,
              display: 'inline-flex',
              gap: 14,
              flexWrap: 'wrap',
              justifyContent: 'center',
              pointerEvents: 'auto',
            }}
          >
            <HeroBtn href="#apps" primary>{copy.exploreApps}</HeroBtn>
            <HeroBtn href="#contact">{copy.contactMe}</HeroBtn>
          </div>
        </div>

        {/* ── 5. ECOSYSTEM headline (stage 1) ─────────────────────── */}
        <div
          ref={ecoHeadingRef}
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 'clamp(80px, 14vh, 140px)',
            transform: 'translateX(-50%)',
            zIndex: 3,
            textAlign: 'center',
            pointerEvents: 'none',
            opacity: 0,
            willChange: 'transform, opacity',
          }}
        >
          <div style={{
            fontFamily: 'var(--mono)',
            fontSize: 10.5,
            letterSpacing: '0.36em',
            color: 'var(--accent)',
            marginBottom: 14,
          }}>
            {copy.ecosystemLabel}
          </div>
          <h2 style={{
            fontFamily: 'var(--display)',
            fontWeight: 700,
            fontSize: 'clamp(28px, 4vw, 52px)',
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
            lineHeight: 1.05,
          }}>
            {copy.ecosystemHeading}
          </h2>
          <p
            ref={ecoSubRef}
            style={{
              marginTop: 12,
              fontSize: 'clamp(14px, 1.4vw, 16px)',
              color: 'var(--ink2)',
              maxWidth: 520,
              margin: '12px auto 0',
            }}
          >
            {copy.ecosystemSub}
          </p>
        </div>

        {/* ── 6. FOCUSED APP PANEL (stages 2..7) ──────────────────── */}
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

        {/* ── 7. SCROLL HINT ───────────────────────────────────────── */}
        <div
          ref={scrollHintRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 28,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            zIndex: 3,
            opacity: 0,
            willChange: 'opacity',
            pointerEvents: 'none',
          }}
        >
          <div style={{
            width: 1,
            height: 44,
            background: 'linear-gradient(to bottom, transparent, rgba(61,183,255,0.7))',
            animation: 'scroll-line 2.4s ease-in-out infinite',
          }} />
          <span style={{
            fontFamily: 'var(--mono)',
            fontSize: 10,
            letterSpacing: 3,
            color: 'var(--ink3)',
          }}>
            {copy.scrollHint.toUpperCase()}
          </span>
        </div>

        {/* ── 8. PROGRESS DOTS ─────────────────────────────────────── */}
        <ProgressDots active={active} count={APPS.length} />
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */

function NodeChip({ initial, active }) {
  // A small hexagonal-feel chip. Not a sphere.
  return (
    <div
      style={{
        width: active ? 46 : 34,
        height: active ? 46 : 34,
        borderRadius: 12,
        display: 'grid',
        placeItems: 'center',
        background: active
          ? 'linear-gradient(135deg, rgba(61,183,255,0.95), rgba(180,247,255,0.85))'
          : 'rgba(10,18,28,0.92)',
        border: `1px solid ${active ? 'rgba(180,247,255,0.95)' : 'rgba(61,183,255,0.38)'}`,
        boxShadow: active
          ? '0 0 28px rgba(61,183,255,0.85), 0 0 60px rgba(61,183,255,0.4), inset 0 0 14px rgba(180,247,255,0.5)'
          : '0 0 14px rgba(61,183,255,0.22), inset 0 0 6px rgba(61,183,255,0.18)',
        color: active ? '#02101E' : 'var(--accent)',
        fontFamily: 'var(--display)',
        fontWeight: 800,
        fontSize: active ? 18 : 13,
        letterSpacing: '-0.02em',
        transition: 'all 0.5s cubic-bezier(.16,.84,.36,1)',
        position: 'relative',
      }}
    >
      {initial}
      {/* corner ticks */}
      <span style={{ position: 'absolute', inset: 2, borderRadius: 10, border: '1px solid rgba(61,183,255,0.18)', pointerEvents: 'none' }} />
    </div>
  );
}

function NodeLabel({ app, lang, labelLeft, active }) {
  return (
    <div
      style={{
        textAlign: labelLeft ? 'left' : 'right',
        fontFamily: 'var(--display)',
        color: active ? 'var(--accent)' : 'var(--ink2)',
        transition: 'color 0.4s, opacity 0.4s',
        opacity: active ? 1 : 0.78,
        whiteSpace: 'nowrap',
      }}
    >
      <div style={{
        fontWeight: 700,
        fontSize: 14,
        letterSpacing: '-0.01em',
      }}>
        {app.name}
      </div>
      <div style={{
        fontFamily: 'var(--mono)',
        fontSize: 10,
        letterSpacing: '0.22em',
        color: 'var(--ink3)',
        textTransform: 'uppercase',
        marginTop: 2,
      }}>
        {app[lang].short}
      </div>
    </div>
  );
}

function OrbCore() {
  // Polished orb: deep blue base, electric blue rim/highlight, two slow rings.
  // Darker and more premium than the previous bright-aqua sphere.
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        animation: 'orb-float 6.4s ease-in-out infinite',
      }}
    >
      {/* outer atmospheric glow */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        inset: '-30%',
        borderRadius: '50%',
        background:
          'radial-gradient(circle, rgba(61,183,255,0.40) 0%, rgba(30,136,217,0.10) 38%, transparent 70%)',
        filter: 'blur(38px)',
        animation: 'orb-glow-pulse 4.2s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* sphere body */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: [
          'radial-gradient(circle at 32% 26%,',
          '  #67D6FF 0%,',
          '  #3DB7FF 8%,',
          '  #1E88D9 22%,',
          '  #0E3A5C 46%,',
          '  #061726 72%,',
          '  #03070D 100%)',
        ].join(' '),
        boxShadow: [
          'inset -28px -36px 70px rgba(0,0,0,0.85)',
          'inset 10px 12px 38px rgba(61,183,255,0.20)',
          '0 0 60px rgba(61,183,255,0.45)',
          '0 0 140px rgba(30,136,217,0.30)',
          '0 0 240px rgba(61,183,255,0.10)',
        ].join(', '),
      }} />

      {/* rim highlight */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background:
          'radial-gradient(circle at 50% 50%, transparent 62%, rgba(103,214,255,0.28) 70%, transparent 78%)',
        mixBlendMode: 'screen',
        pointerEvents: 'none',
      }} />

      {/* specular */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        top: '14%',
        left: '22%',
        width: '28%',
        height: '18%',
        borderRadius: '50%',
        background:
          'radial-gradient(circle, rgba(207,231,247,0.55) 0%, transparent 100%)',
        filter: 'blur(6px)',
        pointerEvents: 'none',
      }} />

      {/* deep inner shadow ring (terminator) */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        boxShadow: 'inset 0 0 80px rgba(2,16,30,0.6)',
        pointerEvents: 'none',
      }} />

      {/* slow orbital ring A */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        inset: -16,
        borderRadius: '50%',
        border: '1px dashed rgba(61,183,255,0.32)',
        animation: 'ring-spin-a 18s linear infinite',
        pointerEvents: 'none',
      }} />
      {/* slow orbital ring B */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        inset: 14,
        borderRadius: '50%',
        border: '1px dashed rgba(207,231,247,0.10)',
        animation: 'ring-spin-b 28s linear infinite',
        pointerEvents: 'none',
      }} />

      {/* faint outer halo ring */}
      <svg
        aria-hidden="true"
        width="100%" height="100%"
        viewBox="0 0 100 100"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <circle
          cx="50" cy="50" r="49.2"
          fill="none"
          stroke="rgba(61,183,255,0.18)"
          strokeWidth="0.3"
          strokeDasharray="0.6 1.8"
        />
      </svg>
    </div>
  );
}

function ConstellationSVG({
  edgeRefs,
  centerEdgeRefs,
  innerEdgeRefs,
  innerInnerEdgeRefs,
  ringRefs,
  active,
}) {
  return (
    <svg
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 'var(--net-intensity, 0.5)',
        transition: 'opacity 0.5s',
        overflow: 'visible',
      }}
    >
      <defs>
        <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="hubFlare" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(61,183,255,0.45)" />
          <stop offset="60%" stopColor="rgba(61,183,255,0.06)" />
          <stop offset="100%" stopColor="rgba(61,183,255,0)" />
        </radialGradient>
      </defs>

      {/* Concentric scaffolding rings (in vmin via attribute) */}
      <g>
        {RINGS.map((ring, i) => (
          <circle
            key={`r${i}`}
            ref={(el) => (ringRefs.current[i] = el)}
            cx="50%"
            cy="50%"
            r={`${ring.r}vmin`}
            fill="none"
            stroke="rgba(61,183,255,0.55)"
            strokeWidth="0.6"
            strokeDasharray={ring.dash}
            opacity={ring.op}
          />
        ))}
      </g>

      {/* Center hub flare (soft glow behind hub) */}
      <circle cx="50%" cy="50%" r="8vmin" fill="url(#hubFlare)" />

      {/* Inner-inner mesh (between waypoints) */}
      {INNER_INNER_EDGES.map(([a, b], i) => {
        const pa = INNER_POS[a];
        const pb = INNER_POS[b];
        return (
          <line
            key={`ii${i}`}
            ref={(el) => (innerInnerEdgeRefs.current[i] = el)}
            pathLength="1"
            x1={`calc(50% + ${pa.x}vmin)`}
            y1={`calc(50% + ${pa.y}vmin)`}
            x2={`calc(50% + ${pb.x}vmin)`}
            y2={`calc(50% + ${pb.y}vmin)`}
            stroke="rgba(61,183,255,0.35)"
            strokeWidth="0.55"
          />
        );
      })}

      {/* Inner edges (app node → waypoint) — builds dense central web */}
      {INNER_EDGES.map(([appIdx, innerIdx], i) => {
        const pa = NODE_POS[appIdx];
        const pb = INNER_POS[innerIdx];
        const isActive = active === appIdx;
        return (
          <line
            key={`ie${i}`}
            ref={(el) => (innerEdgeRefs.current[i] = el)}
            pathLength="1"
            x1={`calc(50% + ${pa.x}vmin)`}
            y1={`calc(50% + ${pa.y}vmin)`}
            x2={`calc(50% + ${pb.x}vmin)`}
            y2={`calc(50% + ${pb.y}vmin)`}
            stroke={isActive ? 'rgba(61,183,255,0.7)' : 'rgba(61,183,255,0.3)'}
            strokeWidth={isActive ? 0.9 : 0.5}
            filter={isActive ? 'url(#lineGlow)' : undefined}
            style={{ transition: 'stroke 0.5s, stroke-width 0.5s' }}
          />
        );
      })}

      {/* Radial spokes (app node → exact center) */}
      {NODE_POS.map((p, i) => {
        const x2 = `calc(50% + ${p.x}vmin)`;
        const y2 = `calc(50% + ${p.y}vmin)`;
        const isActive = active === i;
        return (
          <line
            key={`c${i}`}
            ref={(el) => (centerEdgeRefs.current[i] = el)}
            pathLength="1"
            x1="50%"
            y1="50%"
            x2={x2}
            y2={y2}
            stroke={isActive ? 'rgba(61,183,255,0.95)' : 'rgba(61,183,255,0.42)'}
            strokeWidth={isActive ? 1.6 : 0.8}
            strokeDasharray={isActive ? '0' : '4 7'}
            filter={isActive ? 'url(#lineGlow)' : undefined}
            style={{ transition: 'stroke 0.5s, stroke-width 0.5s' }}
          />
        );
      })}

      {/* Outer mesh + cross-center diagonals */}
      {NODE_EDGES.map(([a, b], i) => {
        const pa = NODE_POS[a];
        const pb = NODE_POS[b];
        const isActive = active === a || active === b;
        return (
          <line
            key={`e${i}`}
            ref={(el) => (edgeRefs.current[i] = el)}
            pathLength="1"
            x1={`calc(50% + ${pa.x}vmin)`}
            y1={`calc(50% + ${pa.y}vmin)`}
            x2={`calc(50% + ${pb.x}vmin)`}
            y2={`calc(50% + ${pb.y}vmin)`}
            stroke={isActive ? 'rgba(61,183,255,0.55)' : 'rgba(61,183,255,0.2)'}
            strokeWidth={isActive ? 0.95 : 0.5}
            style={{ transition: 'stroke 0.5s, stroke-width 0.5s' }}
          />
        );
      })}
    </svg>
  );
}

function CenterHub({ innerRef }) {
  // A wireframe hex hub at the exact center — focal point of every line.
  // Not a sphere. Geometric, structural.
  const SIZE = 56;
  return (
    <div
      ref={innerRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: SIZE,
        height: SIZE,
        marginLeft: -SIZE / 2,
        marginTop: -SIZE / 2,
        zIndex: 3,
        opacity: 0,
        willChange: 'transform, opacity',
      }}
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox="0 0 100 100"
        style={{
          width: '100%',
          height: '100%',
          filter: 'drop-shadow(0 0 12px rgba(61,183,255,0.7))',
        }}
      >
        {/* outer hex */}
        <polygon
          points="50,6 90,28 90,72 50,94 10,72 10,28"
          fill="none"
          stroke="rgba(61,183,255,0.9)"
          strokeWidth="1.4"
        />
        {/* inner hex */}
        <polygon
          points="50,22 76,36 76,64 50,78 24,64 24,36"
          fill="none"
          stroke="rgba(180,247,255,0.7)"
          strokeWidth="1"
        />
        {/* cross marks */}
        <line x1="50" y1="50" x2="50" y2="20" stroke="rgba(61,183,255,0.55)" strokeWidth="0.7" />
        <line x1="50" y1="50" x2="50" y2="80" stroke="rgba(61,183,255,0.55)" strokeWidth="0.7" />
        <line x1="50" y1="50" x2="22" y2="50" stroke="rgba(61,183,255,0.55)" strokeWidth="0.7" />
        <line x1="50" y1="50" x2="78" y2="50" stroke="rgba(61,183,255,0.55)" strokeWidth="0.7" />
        {/* core dot */}
        <circle cx="50" cy="50" r="3.5" fill="rgba(61,183,255,1)" />
        <circle cx="50" cy="50" r="6" fill="none" stroke="rgba(61,183,255,0.6)" strokeWidth="0.6" />
      </svg>
    </div>
  );
}

function FocusedAppPanel({ app, lang, copy, numLabel, panelRight, panelRef, numberRef }) {
  const t = app[lang];
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 3,
        pointerEvents: 'none',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        alignItems: 'center',
        padding: 'clamp(96px, 12vh, 140px) clamp(28px, 6vw, 88px)',
      }}
    >
      <div
        ref={numberRef}
        aria-hidden="true"
        style={{
          gridColumn: panelRight ? 1 : 2,
          gridRow: 1,
          justifySelf: panelRight ? 'start' : 'end',
          fontFamily: 'var(--display)',
          fontWeight: 800,
          fontSize: 'clamp(160px, 26vw, 380px)',
          lineHeight: 0.82,
          letterSpacing: '-0.06em',
          color: 'transparent',
          WebkitTextStroke: '1.4px rgba(61,183,255,0.5)',
          textShadow: '0 0 80px rgba(61,183,255,0.35), 0 0 160px rgba(61,183,255,0.18)',
          userSelect: 'none',
          willChange: 'transform, opacity',
        }}
      >
        {numLabel}
      </div>

      <div
        ref={panelRef}
        style={{
          gridColumn: panelRight ? 2 : 1,
          gridRow: 1,
          justifySelf: panelRight ? 'end' : 'start',
          maxWidth: 460,
          textAlign: 'left',
          pointerEvents: 'auto',
        }}
      >
        <div data-stagger style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          fontFamily: 'var(--mono)',
          fontSize: 11,
          letterSpacing: '0.36em',
          color: 'var(--accent)',
          textTransform: 'uppercase',
          marginBottom: 18,
          willChange: 'transform, opacity',
        }}>
          <span style={{
            width: 28,
            height: 1,
            background: 'var(--accent)',
            opacity: 0.65,
          }} />
          {t.tag}
        </div>

        <h3 data-stagger style={{
          fontFamily: 'var(--display)',
          fontWeight: 800,
          fontSize: 'clamp(44px, 5.6vw, 78px)',
          lineHeight: 0.98,
          letterSpacing: '-0.035em',
          color: '#CFE7F7',
          textShadow: '0 0 40px rgba(61,183,255,0.4), 0 0 90px rgba(61,183,255,0.18)',
          willChange: 'transform, opacity',
        }}>
          {app.name}
        </h3>

        <p data-stagger style={{
          marginTop: 18,
          fontSize: 'clamp(15px, 1.35vw, 17px)',
          color: 'var(--ink2)',
          lineHeight: 1.65,
          maxWidth: 420,
          willChange: 'transform, opacity',
        }}>
          {t.desc}
        </p>

        <div data-stagger style={{ marginTop: 26, willChange: 'transform, opacity' }}>
          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '13px 26px',
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 600,
              color: '#02101E',
              background: 'linear-gradient(135deg, #3DB7FF 0%, #67D6FF 100%)',
              border: '1px solid rgba(255,255,255,0.45)',
              boxShadow:
                '0 8px 32px rgba(61,183,255,0.45), inset 0 1px 0 rgba(255,255,255,0.45)',
              textDecoration: 'none',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.025)';
              e.currentTarget.style.boxShadow =
                '0 14px 48px rgba(61,183,255,0.7), inset 0 1px 0 rgba(255,255,255,0.55)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow =
                '0 8px 32px rgba(61,183,255,0.45), inset 0 1px 0 rgba(255,255,255,0.45)';
            }}
          >
            {copy.openApp}
            <span style={{ fontSize: 16 }}>→</span>
          </a>
        </div>
      </div>
    </div>
  );
}

function ProgressDots({ active, count }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        right: 24,
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        zIndex: 4,
        pointerEvents: 'none',
      }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const isActive = active === i;
        return (
          <div
            key={i}
            style={{
              width: isActive ? 10 : 6,
              height: isActive ? 10 : 6,
              borderRadius: '50%',
              border: '1px solid rgba(61,183,255,0.55)',
              background: isActive ? 'var(--accent)' : 'transparent',
              boxShadow: isActive ? '0 0 12px rgba(61,183,255,0.85)' : 'none',
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
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '14px 30px',
        borderRadius: 999,
        fontSize: 14.5,
        fontWeight: 600,
        letterSpacing: '0.02em',
        textDecoration: 'none',
        background: primary
          ? 'linear-gradient(135deg, #3DB7FF 0%, #67D6FF 100%)'
          : 'rgba(255,255,255,0.03)',
        color: primary ? '#02101E' : 'var(--ink)',
        border: primary ? '1px solid rgba(255,255,255,0.45)' : '1px solid rgba(255,255,255,0.16)',
        backdropFilter: primary ? 'none' : 'blur(10px)',
        WebkitBackdropFilter: primary ? 'none' : 'blur(10px)',
        boxShadow: primary
          ? '0 8px 32px rgba(61,183,255,0.45), inset 0 1px 0 rgba(255,255,255,0.45)'
          : '0 4px 18px rgba(0,0,0,0.3)',
        transition:
          'transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease, border-color 0.25s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px) scale(1.025)';
        if (primary) {
          e.currentTarget.style.boxShadow =
            '0 14px 50px rgba(61,183,255,0.7), inset 0 1px 0 rgba(255,255,255,0.55)';
        } else {
          e.currentTarget.style.borderColor = 'rgba(61,183,255,0.55)';
          e.currentTarget.style.background = 'rgba(61,183,255,0.08)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        if (primary) {
          e.currentTarget.style.boxShadow =
            '0 8px 32px rgba(61,183,255,0.45), inset 0 1px 0 rgba(255,255,255,0.45)';
        } else {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
        }
      }}
    >
      {children}
      {primary && <span style={{ fontSize: 16, marginLeft: 2 }}>→</span>}
    </a>
  );
}
