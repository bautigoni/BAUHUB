import { useEffect, useRef, useState } from 'react';

export default function AppChapter({ app, idx, lang, copy }) {
  const rootRef = useRef(null);
  const numberRef = useRef(null);
  const [active, setActive] = useState(false);

  const reverse = idx % 2 === 1;
  const appCopy = app[lang];
  const num = String(idx + 1).padStart(2, '0');

  // active-section glow intensification
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting && entry.intersectionRatio > 0.45),
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // subtle parallax on the giant number
  useEffect(() => {
    const el = rootRef.current;
    const numEl = numberRef.current;
    if (!el || !numEl) return;
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const progress = (vh - r.top) / (vh + r.height);
        const offset = (progress - 0.5) * 70;
        numEl.style.transform = `translate3d(0, ${offset}px, 0)`;
        raf = null;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <article
      ref={rootRef}
      data-reveal="chapter"
      data-side={reverse ? 'right' : 'left'}
      className="app-chapter"
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'clamp(24px, 6vw, 80px)',
        alignItems: 'center',
        minHeight: 'min(640px, 75vh)',
        padding: 'clamp(48px, 8vw, 120px) 0',
      }}
    >
      {/* hairline divider above each chapter (except first) */}
      {idx > 0 && (
        <div aria-hidden="true" style={{
          position: 'absolute',
          top: 0,
          left: '8%',
          right: '8%',
          height: 1,
          background: 'linear-gradient(to right, transparent, rgba(61,183,255,0.18), transparent)',
        }} />
      )}

      {/* GIANT NUMBER side */}
      <div
        data-reveal-el="number"
        style={{
          order: reverse ? 2 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: reverse ? 'flex-start' : 'flex-end',
          position: 'relative',
        }}
      >
        <div
          ref={numberRef}
          aria-hidden="true"
          style={{
            position: 'relative',
            fontFamily: 'var(--display)',
            fontWeight: 800,
            fontSize: 'clamp(200px, 30vw, 460px)',
            lineHeight: 0.82,
            letterSpacing: '-0.06em',
            color: 'transparent',
            WebkitTextStroke: active
              ? '1.5px rgba(61,183,255,0.6)'
              : '1px rgba(61,183,255,0.25)',
            textShadow: active
              ? '0 0 80px rgba(61,183,255,0.4), 0 0 140px rgba(61,183,255,0.18)'
              : '0 0 30px rgba(61,183,255,0.1)',
            transition: 'all 0.7s ease',
            userSelect: 'none',
          }}
        >
          {num}
        </div>
      </div>

      {/* CONTENT side */}
      <div
        data-reveal-el="content"
        style={{
          order: reverse ? 1 : 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          maxWidth: 520,
          justifySelf: reverse ? 'end' : 'start',
        }}
      >
        {/* category label */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          fontFamily: 'var(--mono)',
          fontSize: 11,
          letterSpacing: '0.32em',
          color: 'var(--accent)',
          textTransform: 'uppercase',
        }}>
          <span style={{
            width: 28,
            height: 1,
            background: 'var(--accent)',
            opacity: 0.65,
          }} />
          {appCopy.tag}
        </div>

        {/* name — solid color transition, no clipped-bg gradient (avoids render artifacts) */}
        <h3 style={{
          fontFamily: 'var(--display)',
          fontWeight: 800,
          fontSize: 'clamp(40px, 5.5vw, 72px)',
          lineHeight: 0.98,
          letterSpacing: '-0.035em',
          color: active ? '#CFE7F7' : '#ffffff',
          textShadow: active
            ? '0 0 40px rgba(61,183,255,0.45), 0 0 80px rgba(61,183,255,0.18)'
            : '0 0 30px rgba(61,183,255,0.06)',
          transition: 'color 0.7s ease, text-shadow 0.7s ease',
        }}>
          {app.name}
        </h3>

        {/* description */}
        <p style={{
          fontSize: 'clamp(15px, 1.4vw, 17.5px)',
          color: 'var(--ink2)',
          lineHeight: 1.7,
        }}>
          {appCopy.desc}
        </p>

        {/* CTA */}
        <div style={{ marginTop: 14 }}>
          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 24px',
              borderRadius: 999,
              fontSize: 13.5,
              fontWeight: 600,
              color: 'var(--accent)',
              border: '1px solid rgba(61,183,255,0.35)',
              background: 'rgba(61,183,255,0.04)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              textDecoration: 'none',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(61,183,255,0.14)';
              e.currentTarget.style.borderColor = 'rgba(61,183,255,0.75)';
              e.currentTarget.style.gap = '14px';
              e.currentTarget.style.transform = 'translateX(2px)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(61,183,255,0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(61,183,255,0.04)';
              e.currentTarget.style.borderColor = 'rgba(61,183,255,0.35)';
              e.currentTarget.style.gap = '10px';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {copy.openApp}
            <span style={{ fontSize: 16 }}>→</span>
          </a>
        </div>
      </div>
    </article>
  );
}
