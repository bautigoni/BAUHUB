import { useEffect, useRef } from 'react';

/**
 * Fine grid + faint glowing network lines that subtly drift on scroll.
 * Pure-CSS grid + a static SVG network — cheap to render, ambient.
 */
export default function MeshBackground() {
  const wrapRef = useRef(null);

  useEffect(() => {
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        if (wrapRef.current) {
          wrapRef.current.style.transform = `translate3d(0, ${y * -0.04}px, 0)`;
        }
        raf = null;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: '-10% -5% -10% -5%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* fine grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: [
          'linear-gradient(rgba(75,227,255,0.045) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(75,227,255,0.045) 1px, transparent 1px)',
        ].join(', '),
        backgroundSize: '64px 64px, 64px 64px',
        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, #000 35%, transparent 85%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, #000 35%, transparent 85%)',
      }} />

      {/* denser sub-grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: [
          'linear-gradient(rgba(75,227,255,0.02) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(75,227,255,0.02) 1px, transparent 1px)',
        ].join(', '),
        backgroundSize: '16px 16px, 16px 16px',
        maskImage: 'radial-gradient(ellipse 60% 40% at 50% 50%, #000 20%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse 60% 40% at 50% 50%, #000 20%, transparent 70%)',
      }} />

      {/* glowing network lines */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, opacity: 0.35 }}
      >
        <defs>
          <radialGradient id="node-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4be3ff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#4be3ff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="line-grad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#4be3ff" stopOpacity="0" />
            <stop offset="50%" stopColor="#4be3ff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#4be3ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {NETWORK_LINES.map((l, i) => (
          <line
            key={i}
            x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]}
            stroke="url(#line-grad)"
            strokeWidth="0.6"
          />
        ))}
        {NETWORK_NODES.map((n, i) => (
          <g key={i}>
            <circle cx={n[0]} cy={n[1]} r="14" fill="url(#node-glow)" />
            <circle cx={n[0]} cy={n[1]} r="1.6" fill="#4be3ff" />
          </g>
        ))}
      </svg>

      {/* ambient cyan vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: [
          'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(75,227,255,0.10), transparent 60%)',
          'radial-gradient(ellipse 50% 40% at 90% 60%, rgba(75,227,255,0.05), transparent 65%)',
          'radial-gradient(ellipse 50% 40% at 10% 80%, rgba(75,227,255,0.04), transparent 65%)',
        ].join(', '),
      }} />
    </div>
  );
}

const NETWORK_NODES = [
  [120, 180], [340, 90], [560, 220], [820, 120], [930, 340],
  [180, 480], [420, 540], [680, 460], [880, 620],
  [80, 760], [300, 820], [540, 760], [760, 880], [950, 800],
];

const NETWORK_LINES = [
  [120, 180, 340, 90], [340, 90, 560, 220], [560, 220, 820, 120],
  [820, 120, 930, 340], [560, 220, 680, 460], [180, 480, 420, 540],
  [420, 540, 680, 460], [680, 460, 880, 620], [180, 480, 300, 820],
  [300, 820, 540, 760], [540, 760, 760, 880], [760, 880, 950, 800],
  [880, 620, 950, 800], [420, 540, 540, 760], [80, 760, 300, 820],
  [120, 180, 180, 480],
];
