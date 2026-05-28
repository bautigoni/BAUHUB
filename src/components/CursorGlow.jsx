import { useEffect, useRef } from 'react';

/**
 * Cyan spotlight that follows the cursor with eased motion.
 * Sits above MeshBackground but below everything else (mix-blend-mode: screen).
 */
export default function CursorGlow() {
  const ref = useRef(null);
  const haloRef = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const halo = haloRef.current;
    if (!el) return;

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let cx = tx, cy = ty;
    let hx = tx, hy = ty;
    let raf = null;
    let visible = false;

    const onMove = (e) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) {
        visible = true;
        el.style.opacity = '1';
        if (halo) halo.style.opacity = '1';
      }
    };
    const onLeave = () => {
      visible = false;
      el.style.opacity = '0';
      if (halo) halo.style.opacity = '0';
    };

    const tick = () => {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      hx += (tx - hx) * 0.06;
      hy += (ty - hy) * 0.06;
      el.style.transform = `translate3d(${cx - 250}px, ${cy - 250}px, 0)`;
      if (halo) halo.style.transform = `translate3d(${hx - 450}px, ${hy - 450}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* wide soft halo — slow follower */}
      <div
        ref={haloRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 900,
          height: 900,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(47,128,237,0.10) 0%, rgba(47,128,237,0.04) 30%, transparent 65%)',
          filter: 'blur(40px)',
          mixBlendMode: 'screen',
          pointerEvents: 'none',
          zIndex: 1,
          opacity: 0,
          transition: 'opacity 0.5s ease',
          willChange: 'transform',
        }}
      />
      {/* tighter, brighter glow — fast follower */}
      <div
        ref={ref}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(86,182,255,0.16) 0%, rgba(47,128,237,0.05) 40%, transparent 70%)',
          filter: 'blur(20px)',
          mixBlendMode: 'screen',
          pointerEvents: 'none',
          zIndex: 1,
          opacity: 0,
          transition: 'opacity 0.4s ease',
          willChange: 'transform',
        }}
      />
    </>
  );
}
