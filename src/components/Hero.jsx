import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import Orb from './Orb.jsx';

export default function Hero({ copy }) {
  const eyebrowRef = useRef(null);
  const statusRef = useRef(null);
  const wordmarkWrapRef = useRef(null);
  const wordmarkRef = useRef(null);
  const wordmarkGhostRef = useRef(null);
  const wordmarkUnderlineRef = useRef(null);
  const headRef = useRef(null);
  const subRef = useRef(null);
  const sigRef = useRef(null);
  const ctaRef = useRef(null);
  const scrollHintRef = useRef(null);
  const orbWrapRef = useRef(null);
  const sectionRef = useRef(null);
  const mouseTargetRef = useRef({ x: 0, y: 0, scrollY: 0 });

  const [orbSize, setOrbSize] = useState(440);
  const [time, setTime] = useState('');

  useEffect(() => {
    const fmt = () => {
      const d = new Date();
      const hh = String(d.getUTCHours()).padStart(2, '0');
      const mm = String(d.getUTCMinutes()).padStart(2, '0');
      const ss = String(d.getUTCSeconds()).padStart(2, '0');
      return `${hh}:${mm}:${ss} UTC`;
    };
    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const updateSize = () => {
      const w = window.innerWidth;
      if (w < 720) setOrbSize(Math.min(260, w * 0.65));
      else if (w < 1100) setOrbSize(360);
      else setOrbSize(440);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Intro animation — runs pre-paint
  useLayoutEffect(() => {
    const introEls = [
      eyebrowRef.current,
      statusRef.current,
      wordmarkWrapRef.current,
      orbWrapRef.current,
      scrollHintRef.current,
      wordmarkUnderlineRef.current,
    ].filter(Boolean);
    const hiddenEls = [
      headRef.current,
      subRef.current,
      sigRef.current,
      ...(ctaRef.current ? Array.from(ctaRef.current.children) : []),
    ].filter(Boolean);

    gsap.set([...introEls, ...hiddenEls], { opacity: 0 });
    gsap.set(wordmarkUnderlineRef.current, { scaleX: 0, transformOrigin: 'left center' });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to(eyebrowRef.current,  { opacity: 1, y: 0, duration: 0.7, startAt: { y: -10 } })
      .to(statusRef.current,   { opacity: 1, y: 0, duration: 0.6, startAt: { y: -8 } }, '-=0.5')
      .to(orbWrapRef.current,  { opacity: 0.5, duration: 1.4, ease: 'power2.out' }, '-=0.3')
      .to(wordmarkWrapRef.current, { opacity: 1, y: 0, duration: 1.3, ease: 'expo.out', startAt: { y: 60 } }, '-=1.2')
      .to(wordmarkUnderlineRef.current, { opacity: 1, scaleX: 1, duration: 1.2, ease: 'expo.out' }, '-=0.7')
      .to(scrollHintRef.current, { opacity: 0.55, duration: 0.6 }, '-=0.4');

    return () => {
      tl.kill();
      gsap.set([...introEls, ...hiddenEls], { clearProps: 'opacity,transform' });
    };
  }, []);

  // Scroll + reveal — orb moves with depth, doesn't feel pinned
  useEffect(() => {
    const headEl = headRef.current;
    const subEl = subRef.current;
    const sigEl = sigRef.current;
    const ctaEls = ctaRef.current ? Array.from(ctaRef.current.children) : [];

    let raf = null;
    let revealed = false;
    let revealTween = null;

    const applyScroll = (y) => {
      const sectionH = sectionRef.current?.offsetHeight ?? window.innerHeight;
      const progress = Math.min(1, Math.max(0, y / sectionH)); // 0 → 1 through hero
      mouseTargetRef.current.scrollY = y;

      if (wordmarkWrapRef.current) {
        if (y > 0) {
          wordmarkWrapRef.current.style.opacity = String(Math.max(0, 1 - y / 600));
        } else {
          wordmarkWrapRef.current.style.opacity = '1';
        }
      }

      // Orb: smooth depth-based motion — moves UP slowly while shrinking and fading.
      // Uses opacity fade so it exits naturally — no "stuck" feel.
      if (orbWrapRef.current) {
        if (y > 0) {
          const exit = Math.min(1, y / (sectionH * 0.9));
          const op = 0.5 * (1 - exit * 0.85);
          const scale = 1 - exit * 0.25;
          const orbY = -y * 0.35; // moves up faster than scroll → drifts upward visually
          orbWrapRef.current.style.opacity = String(Math.max(0, op));
          orbWrapRef.current.dataset.scrollY = String(orbY);
          orbWrapRef.current.dataset.scrollScale = String(scale);
        } else {
          orbWrapRef.current.style.opacity = '0.5';
          orbWrapRef.current.dataset.scrollY = '0';
          orbWrapRef.current.dataset.scrollScale = '1';
        }
      }
    };

    const triggerReveal = () => {
      if (revealed) return;
      revealed = true;
      revealTween = gsap.timeline({ defaults: { ease: 'expo.out' } });
      revealTween
        .to(headEl,  { opacity: 1, y: 0, duration: 0.9, startAt: { y: 24 } })
        .to(subEl,   { opacity: 1, y: 0, duration: 0.8, startAt: { y: 18 } }, '-=0.7')
        .to(sigEl,   { opacity: 1, y: 0, duration: 0.7, startAt: { y: 14 } }, '-=0.6')
        .to(ctaEls,  { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, startAt: { y: 14 } }, '-=0.55');
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        applyScroll(y);
        if (y > 60) triggerReveal();
        raf = null;
      });
    };

    if (window.scrollY > 0) {
      applyScroll(window.scrollY);
      if (window.scrollY > 60) triggerReveal();
    }
    const fallback = setTimeout(triggerReveal, 4200);

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(fallback);
      if (raf) cancelAnimationFrame(raf);
      if (revealTween) revealTween.kill();
    };
  }, []);

  // Mouse reactivity — animates orb position, wordmark drift, ghost offset
  // via a single rAF loop. Eased follow → never twitchy.
  useEffect(() => {
    const state = { cmx: 0, cmy: 0 };
    let raf = null;

    const onMove = (e) => {
      mouseTargetRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseTargetRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const tick = () => {
      state.cmx += (mouseTargetRef.current.x - state.cmx) * 0.08;
      state.cmy += (mouseTargetRef.current.y - state.cmy) * 0.08;
      const orbY = parseFloat(orbWrapRef.current?.dataset?.scrollY || '0');
      const orbScale = parseFloat(orbWrapRef.current?.dataset?.scrollScale || '1');

      // ORB: mouse + scroll combined
      if (orbWrapRef.current) {
        const mouseShiftX = state.cmx * 22;
        const mouseShiftY = state.cmy * 14;
        orbWrapRef.current.style.transform =
          `translate(-50%, -50%) translate3d(${mouseShiftX}px, ${orbY + mouseShiftY}px, 0) scale(${orbScale})`;
      }

      // WORDMARK: subtle drift
      if (wordmarkRef.current) {
        wordmarkRef.current.style.transform =
          `translate3d(${state.cmx * -6}px, ${state.cmy * -3}px, 0)`;
      }
      // GHOST: opposite, slightly larger offset for parallax
      if (wordmarkGhostRef.current) {
        wordmarkGhostRef.current.style.transform =
          `translate3d(${state.cmx * 10}px, ${state.cmy * 5}px, 0)`;
      }
      // HEAD + SUB: micro-shift
      if (headRef.current) {
        headRef.current.style.transform = headRef.current.style.opacity === '0'
          ? headRef.current.style.transform
          : `translate3d(${state.cmx * -3}px, ${state.cmy * -1.5}px, 0)`;
      }

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      aria-label="Hero"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '96px 24px 80px',
        textAlign: 'center',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      {/* orb */}
      <div
        ref={orbWrapRef}
        className="orb-wrap"
        style={{
          position: 'absolute',
          top: 'calc(50% + 90px)',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0,
          mixBlendMode: 'screen',
          willChange: 'transform, opacity',
        }}
      >
        <Orb size={orbSize} />
      </div>

      {/* top micro UI */}
      <div style={{
        position: 'absolute',
        top: 96,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 clamp(24px, 5vw, 80px)',
        zIndex: 3,
        pointerEvents: 'none',
      }}>
        <div
          ref={eyebrowRef}
          style={{
            opacity: 0,
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
            fontSize: 11,
            letterSpacing: '0.28em',
            color: 'var(--accent)',
          }}
        >
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--accent)',
            boxShadow: '0 0 10px rgba(61,183,255,0.9)',
            animation: 'orb-glow-pulse 2.4s ease-in-out infinite',
          }} />
          {copy.heroLabel ?? 'ESTUDIO DE PRODUCTOS DIGITALES'}
        </div>

        <div
          ref={statusRef}
          style={{
            opacity: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '6px 14px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '0.18em',
            color: 'var(--ink3)',
          }}
        >
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#7cffb2',
            boxShadow: '0 0 8px rgba(124,255,178,0.7)',
            animation: 'orb-glow-pulse 1.6s ease-in-out infinite',
          }} />
          <span>EN LÍNEA</span>
          <span style={{ opacity: 0.4, margin: '0 4px' }}>·</span>
          <span style={{ fontVariantNumeric: 'tabular-nums', minWidth: 96, display: 'inline-block', textAlign: 'left' }}>{time || '00:00:00 UTC'}</span>
        </div>
      </div>

      {/* WORDMARK — layered, futuristic treatment */}
      <div
        ref={wordmarkWrapRef}
        style={{
          opacity: 0,
          position: 'relative',
          zIndex: 2,
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* top corner brackets — sci-fi framing */}
        <div aria-hidden="true" style={{
          position: 'absolute',
          inset: '-22px -8% -22px -8%',
          pointerEvents: 'none',
        }}>
          <Bracket pos="tl" />
          <Bracket pos="tr" />
          <Bracket pos="bl" />
          <Bracket pos="br" />
        </div>

        {/* layered title — ghost behind + main with gradient + thin chromatic shadow */}
        <div style={{ position: 'relative', lineHeight: 0.86 }}>
          {/* cyan ghost behind (parallax follower) */}
          <span
            ref={wordmarkGhostRef}
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              fontFamily: 'var(--display)',
              fontWeight: 800,
              fontSize: 'clamp(96px, 21vw, 320px)',
              lineHeight: 0.86,
              letterSpacing: '-0.06em',
              color: 'transparent',
              WebkitTextStroke: '1px rgba(61,183,255,0.35)',
              filter: 'blur(0.6px)',
              pointerEvents: 'none',
              willChange: 'transform',
            }}
          >
            BauHub
          </span>

          {/* main wordmark */}
          <h1
            ref={wordmarkRef}
            style={{
              position: 'relative',
              fontFamily: 'var(--display)',
              fontWeight: 800,
              fontSize: 'clamp(96px, 21vw, 320px)',
              lineHeight: 0.86,
              letterSpacing: '-0.06em',
              margin: 0,
              background: 'linear-gradient(180deg, #ffffff 0%, #CFE7F7 45%, #3DB7FF 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 6px 80px rgba(61,183,255,0.45))',
              willChange: 'transform',
            }}
          >
            BauHub
          </h1>
        </div>

        {/* version + edition row underneath */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          marginTop: 6,
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
          <span>05 / 05 APPS</span>
        </div>

        {/* animated cyan underline */}
        <div
          ref={wordmarkUnderlineRef}
          aria-hidden="true"
          style={{
            marginTop: 14,
            width: 'min(420px, 60vw)',
            height: 1,
            background: 'linear-gradient(to right, transparent, rgba(61,183,255,0.85), transparent)',
            opacity: 0,
            boxShadow: '0 0 14px rgba(61,183,255,0.5)',
          }}
        />
      </div>

      {/* tagline */}
      <h2
        ref={headRef}
        style={{
          opacity: 0,
          position: 'relative',
          zIndex: 2,
          fontFamily: 'var(--display)',
          fontWeight: 500,
          fontSize: 'clamp(20px, 2.4vw, 28px)',
          lineHeight: 1.25,
          letterSpacing: '-0.01em',
          color: 'var(--ink)',
          maxWidth: 720,
          margin: '40px auto 0',
          willChange: 'transform',
        }}
      >
        {copy.manifesto}
      </h2>

      <p
        ref={subRef}
        style={{
          opacity: 0,
          position: 'relative',
          zIndex: 2,
          marginTop: 16,
          fontSize: 'clamp(15px, 1.6vw, 18px)',
          color: 'var(--ink2)',
          maxWidth: 580,
          lineHeight: 1.6,
        }}
      >
        {copy.subhead}
      </p>

      <div
        ref={sigRef}
        style={{
          opacity: 0,
          position: 'relative',
          zIndex: 2,
          marginTop: 22,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          fontFamily: 'var(--mono)',
          fontSize: 12,
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
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          gap: 14,
          marginTop: 36,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <HeroBtn href="#apps" primary initialHidden>{copy.exploreApps}</HeroBtn>
        <HeroBtn href="#contact" initialHidden>{copy.contactMe}</HeroBtn>
      </div>

      {/* scroll hint */}
      <div
        ref={scrollHintRef}
        aria-hidden="true"
        style={{
          opacity: 0,
          position: 'absolute',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          zIndex: 2,
        }}
      >
        <div style={{
          width: 1,
          height: 44,
          background: 'linear-gradient(to bottom, transparent, rgba(61,183,255,0.7))',
          animation: 'scroll-line 2.4s ease-in-out infinite',
        }} />
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 3, color: 'var(--ink3)' }}>
          SCROLL
        </span>
      </div>
    </section>
  );
}

function Bracket({ pos }) {
  const size = 18;
  const w = 1;
  const c = 'rgba(61,183,255,0.55)';
  const common = {
    position: 'absolute',
    width: size,
    height: size,
    borderColor: c,
    borderStyle: 'solid',
    borderWidth: 0,
  };
  const map = {
    tl: { top: 0, left: 0, borderTopWidth: w, borderLeftWidth: w },
    tr: { top: 0, right: 0, borderTopWidth: w, borderRightWidth: w },
    bl: { bottom: 0, left: 0, borderBottomWidth: w, borderLeftWidth: w },
    br: { bottom: 0, right: 0, borderBottomWidth: w, borderRightWidth: w },
  };
  return <div aria-hidden="true" style={{ ...common, ...map[pos] }} />;
}

function HeroBtn({ href, children, primary = false, initialHidden = false }) {
  const isPrimary = primary;
  return (
    <a
      href={href}
      style={{
        opacity: initialHidden ? 0 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '14px 30px',
        borderRadius: 999,
        fontSize: 14.5,
        fontWeight: 600,
        letterSpacing: '0.02em',
        textDecoration: 'none',
        background: isPrimary
          ? 'linear-gradient(135deg, #3DB7FF 0%, #67D6FF 100%)'
          : 'rgba(255,255,255,0.03)',
        color: isPrimary ? '#02101E' : 'var(--ink)',
        border: isPrimary ? '1px solid rgba(255,255,255,0.45)' : '1px solid rgba(255,255,255,0.16)',
        backdropFilter: isPrimary ? 'none' : 'blur(10px)',
        WebkitBackdropFilter: isPrimary ? 'none' : 'blur(10px)',
        boxShadow: isPrimary
          ? '0 8px 32px rgba(61,183,255,0.45), inset 0 1px 0 rgba(255,255,255,0.45)'
          : '0 4px 18px rgba(0,0,0,0.3)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease, border-color 0.25s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px) scale(1.025)';
        if (isPrimary) {
          e.currentTarget.style.boxShadow = '0 14px 50px rgba(61,183,255,0.7), inset 0 1px 0 rgba(255,255,255,0.55)';
        } else {
          e.currentTarget.style.borderColor = 'rgba(61,183,255,0.55)';
          e.currentTarget.style.background = 'rgba(61,183,255,0.08)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        if (isPrimary) {
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(61,183,255,0.45), inset 0 1px 0 rgba(255,255,255,0.45)';
        } else {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
        }
      }}
    >
      {children}
      {isPrimary && <span style={{ fontSize: 16, marginLeft: 2 }}>→</span>}
    </a>
  );
}
