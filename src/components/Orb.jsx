import { useEffect, useRef } from 'react';

export default function Orb({ size = 300 }) {
  const tiltRef = useRef(null);

  useEffect(() => {
    let raf = null;
    let tx = 0, ty = 0;
    let cx = 0, cy = 0;

    function onMouseMove(e) {
      const ox = e.clientX - window.innerWidth / 2;
      const oy = e.clientY - window.innerHeight / 2;
      const maxD = Math.max(window.innerWidth, window.innerHeight) * 0.5;
      tx = (ox / maxD) * 16;
      ty = (oy / maxD) * 16;
    }
    function onMouseLeave() { tx = 0; ty = 0; }

    function tick() {
      cx += (tx - cx) * 0.055;
      cy += (ty - cy) * 0.055;
      if (tiltRef.current) {
        tiltRef.current.style.transform = `rotateY(${cx}deg) rotateX(${-cy}deg)`;
      }
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  const s = size;
  const half = s / 2;

  return (
    /* float wrapper — CSS animation only, no JS touch */
    <div style={{
      position: 'relative',
      width: s,
      height: s,
      flexShrink: 0,
      animation: 'orb-float 5s ease-in-out infinite',
    }}>

      {/* ambient glow behind sphere */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        inset: -80,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(61,183,255,0.28) 0%, transparent 60%)',
        filter: 'blur(32px)',
        animation: 'orb-glow-pulse 3.6s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* tilt container — JS only, no CSS animation */}
      <div
        ref={tiltRef}
        style={{
          position: 'absolute',
          inset: 0,
          perspective: 700,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {/* sphere body */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: [
            'radial-gradient(circle at 32% 28%,',
            '  #67D6FF 0%,',
            '  #3DB7FF 10%,',
            '  rgba(61,183,255,0.55) 28%,',
            '  rgba(0,160,200,0.18) 52%,',
            '  #0b0b0d 76%)',
          ].join(' '),
          boxShadow: [
            'inset -20px -28px 60px rgba(0,0,0,0.7)',
            'inset 6px 8px 28px rgba(61,183,255,0.15)',
            '0 0 60px rgba(61,183,255,0.5)',
            '0 0 120px rgba(61,183,255,0.2)',
            '0 0 200px rgba(61,183,255,0.08)',
          ].join(', '),
        }} />

        {/* specular highlight */}
        <div aria-hidden="true" style={{
          position: 'absolute',
          top: '12%',
          left: '20%',
          width: '30%',
          height: '20%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.65) 0%, transparent 100%)',
          filter: 'blur(5px)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* orbital ring A — pure CSS rotation */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        inset: -14,
        borderRadius: '50%',
        border: '1px dashed rgba(61,183,255,0.4)',
        animation: 'ring-spin-a 14s linear infinite',
        pointerEvents: 'none',
      }} />

      {/* orbital ring B */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        inset: 12,
        borderRadius: '50%',
        border: '1px dashed rgba(255,255,255,0.15)',
        animation: 'ring-spin-b 22s linear infinite',
        pointerEvents: 'none',
      }} />

      {/* flat outer dashed halo */}
      <svg
        aria-hidden="true"
        width={s} height={s}
        viewBox={`0 0 ${s} ${s}`}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <circle
          cx={half} cy={half} r={half - 2}
          fill="none"
          stroke="rgba(61,183,255,0.15)"
          strokeWidth="1"
          strokeDasharray="3 9"
        />
        <circle
          cx={half} cy={half} r={half * 0.6}
          fill="none"
          stroke="rgba(61,183,255,0.35)"
          strokeWidth="0.8"
        />
      </svg>
    </div>
  );
}
