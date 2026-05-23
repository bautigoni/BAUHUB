import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import AppChapter from './AppCard.jsx';
import { APPS } from '../data.js';

export default function AppsSection({ copy, lang }) {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const subRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const headerEls = [headerRef.current, subRef.current].filter(Boolean);
    gsap.set(headerEls, { opacity: 0, y: 30 });

    const chapters = section.querySelectorAll('[data-reveal="chapter"]');
    chapters.forEach((chap) => {
      const side = chap.dataset.side;
      const num = chap.querySelector('[data-reveal-el="number"]');
      const content = chap.querySelector('[data-reveal-el="content"]');
      if (num) gsap.set(num, { opacity: 0, x: side === 'left' ? -80 : 80 });
      if (content) gsap.set(content, { opacity: 0, x: side === 'left' ? 60 : -60, y: 20 });
    });

    const tweens = [];
    const headerObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const i = headerEls.indexOf(e.target);
        tweens.push(gsap.to(e.target, { opacity: 1, y: 0, duration: 0.9, delay: i * 0.1, ease: 'expo.out' }));
        headerObs.unobserve(e.target);
      });
    }, { threshold: 0.15 });
    headerEls.forEach(el => headerObs.observe(el));

    const chapterObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const num = e.target.querySelector('[data-reveal-el="number"]');
        const content = e.target.querySelector('[data-reveal-el="content"]');
        if (num)     tweens.push(gsap.to(num,     { opacity: 1, x: 0,        duration: 1.4, ease: 'expo.out' }));
        if (content) tweens.push(gsap.to(content, { opacity: 1, x: 0, y: 0, duration: 1.2, delay: 0.18, ease: 'expo.out' }));
        chapterObs.unobserve(e.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -5% 0px' });
    chapters.forEach(c => chapterObs.observe(c));

    return () => {
      headerObs.disconnect();
      chapterObs.disconnect();
      tweens.forEach(t => t.kill());
      gsap.set(headerEls, { clearProps: 'all' });
      chapters.forEach(c => {
        const num = c.querySelector('[data-reveal-el="number"]');
        const content = c.querySelector('[data-reveal-el="content"]');
        if (num) gsap.set(num, { clearProps: 'all' });
        if (content) gsap.set(content, { clearProps: 'all' });
      });
    };
  }, [lang]);

  return (
    <section
      id="apps"
      ref={sectionRef}
      aria-label="Apps"
      style={{
        position: 'relative',
        zIndex: 1,
        padding: 'clamp(80px,10vw,140px) clamp(24px,6vw,96px) clamp(60px,8vw,120px)',
        maxWidth: 1280,
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* section label */}
      <div
        ref={headerRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          marginBottom: 28,
        }}
      >
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          letterSpacing: '0.32em',
          color: 'var(--accent)',
          opacity: 0.9,
          whiteSpace: 'nowrap',
        }}>
          {copy.appsLabel}
        </div>
        <div style={{
          flex: 1,
          height: 1,
          background: 'linear-gradient(to right, rgba(75,227,255,0.35), transparent)',
        }} />
      </div>

      <p
        ref={subRef}
        style={{
          fontFamily: 'var(--display)',
          fontWeight: 500,
          fontSize: 'clamp(20px, 2.4vw, 28px)',
          color: 'var(--ink)',
          maxWidth: 720,
          lineHeight: 1.35,
          letterSpacing: '-0.01em',
          marginBottom: 'clamp(40px, 6vw, 80px)',
        }}
      >
        {copy.appsSub}
      </p>

      <div style={{ position: 'relative' }}>
        {APPS.map((app, i) => (
          <AppChapter key={app.id} app={app} idx={i} lang={lang} copy={copy} />
        ))}
      </div>
    </section>
  );
}
