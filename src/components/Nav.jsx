import { useState, useEffect } from 'react';

export default function Nav({ copy, lang, onLangToggle }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 120);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const anchors = [
    { label: copy.nav[0], href: '#hero' },
    { label: copy.nav[1], href: '#apps' },
    { label: copy.nav[2], href: '#contact' },
  ];

  return (
    <nav
      aria-label="Main navigation"
      style={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 20px',
        borderRadius: 999,
        background: 'rgba(11,11,13,0.75)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(61,183,255,0.15)',
        boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        animation: visible ? 'nav-slide-down 0.35s ease forwards' : 'none',
      }}
    >
      <a href="#hero" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: 'var(--display)',
        fontWeight: 800,
        fontSize: 16,
        letterSpacing: '-0.02em',
        marginRight: 8,
        background: 'linear-gradient(180deg, #ffffff 0%, #3DB7FF 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
      }}>
        <span aria-hidden="true" style={{
          width: 10, height: 10, borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, #CFE7F7, #3DB7FF 50%, #1E88D9)',
          boxShadow: '0 0 10px rgba(61,183,255,0.9)',
          WebkitTextFillColor: 'initial',
        }} />
        BauHub
      </a>

      {anchors.map(({ label, href }) => (
        <a
          key={href}
          href={href}
          style={{
            padding: '4px 12px',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--ink2)',
            transition: 'color 0.2s, background 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--accent)';
            e.currentTarget.style.background = 'rgba(61,183,255,0.08)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--ink2)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          {label}
        </a>
      ))}

      <button
        onClick={onLangToggle}
        aria-label="Toggle language"
        style={{
          marginLeft: 8,
          padding: '4px 10px',
          borderRadius: 999,
          fontSize: 11,
          fontFamily: 'var(--mono)',
          letterSpacing: 1,
          color: 'var(--accent)',
          border: '1px solid rgba(61,183,255,0.3)',
          transition: 'background 0.2s, border-color 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(61,183,255,0.12)';
          e.currentTarget.style.borderColor = 'rgba(61,183,255,0.7)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = 'rgba(61,183,255,0.3)';
        }}
      >
        {copy.langToggle}
      </button>
    </nav>
  );
}
