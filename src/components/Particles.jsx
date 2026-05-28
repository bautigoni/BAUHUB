import { useMemo } from 'react';

const SEED_COUNT = 60;

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export default function Particles() {
  const dots = useMemo(() => {
    const rand = seededRandom(42);
    return Array.from({ length: SEED_COUNT }, (_, i) => ({
      id: i,
      x: rand() * 100,
      y: rand() * 100,
      size: 1 + rand() * 2,
      delay: rand() * 6,
      duration: 2.5 + rand() * 4,
    }));
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
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
            background: 'rgba(61,183,255,0.7)',
            animation: `twinkle ${d.duration}s ${d.delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}
