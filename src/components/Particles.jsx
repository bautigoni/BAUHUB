import { useEffect, useMemo, useRef } from 'react';

const SEED_COUNT = 34;

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export default function Particles() {
  const layerRef = useRef(null);

  const dots = useMemo(() => {
    const rand = seededRandom(42);
    return Array.from({ length: SEED_COUNT }, (_, i) => ({
      id: i,
      x: rand() * 100,
      y: rand() * 100,
      size: 1 + rand() * 2,
      delay: rand() * 6,
      duration: 2.5 + rand() * 4,
      depth: 0.04 + rand() * 0.14, // parallax factor
    }));
  }, []);

  // eased scroll parallax — particles drift up slower than the page
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let target = 0;
    let current = 0;
    let raf = null;
    const onScroll = () => { target = window.scrollY; };
    const tick = () => {
      current += (target - current) * 0.08;
      layer.style.transform = `translate3d(0, ${current * -0.06}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    onScroll();
    raf = requestAnimationFrame(tick);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        willChange: 'transform',
      }}
    >
      {dots.map(d => (
        <div
          key={d.id}
          style={{
            position: 'absolute',
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            borderRadius: '50%',
            background: 'rgba(127,210,255,0.45)',
            animation: `twinkle ${d.duration}s ${d.delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}
