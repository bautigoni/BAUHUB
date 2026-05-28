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
      {/* fine grid — single, faint, masked to fade at edges */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: [
          'linear-gradient(rgba(47,128,237,0.030) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(47,128,237,0.030) 1px, transparent 1px)',
        ].join(', '),
        backgroundSize: '72px 72px, 72px 72px',
        maskImage: 'radial-gradient(ellipse 78% 58% at 50% 32%, #000 30%, transparent 82%)',
        WebkitMaskImage: 'radial-gradient(ellipse 78% 58% at 50% 32%, #000 30%, transparent 82%)',
      }} />

      {/* ambient vignette — deep blue, restrained */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: [
          'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(47,128,237,0.06), transparent 60%)',
          'radial-gradient(ellipse 50% 40% at 88% 62%, rgba(14,59,102,0.06), transparent 66%)',
        ].join(', '),
      }} />
    </div>
  );
}
