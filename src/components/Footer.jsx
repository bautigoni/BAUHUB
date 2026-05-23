import { APPS } from '../data.js';

export default function Footer({ copy }) {
  return (
    <footer
      style={{
        position: 'relative',
        zIndex: 1,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        marginTop: 40,
        padding: 'clamp(48px,5vw,72px) clamp(20px,5vw,80px) clamp(28px,3vw,40px)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'clamp(32px, 4vw, 64px)',
        background: 'linear-gradient(to bottom, transparent, rgba(75,227,255,0.02))',
      }}
    >
      {/* brand */}
      <div>
        <div style={{
          fontFamily: 'var(--display)',
          fontWeight: 800,
          fontSize: 32,
          letterSpacing: '-0.03em',
          background: 'linear-gradient(180deg, #ffffff 0%, #4be3ff 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          WebkitTextFillColor: 'transparent',
          marginBottom: 12,
        }}>
          BauHub
        </div>
        <div style={{
          fontSize: 13,
          color: 'var(--ink2)',
          lineHeight: 1.55,
          maxWidth: 280,
          marginBottom: 14,
        }}>
          A personal product ecosystem of focused apps for education, operations and clarity.
        </div>
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          letterSpacing: '0.18em',
          color: 'var(--ink3)',
          textTransform: 'uppercase',
        }}>
          {copy.footerTagline}
        </div>
      </div>

      {/* app links */}
      <div>
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          letterSpacing: '0.22em',
          color: 'var(--accent)',
          opacity: 0.85,
          marginBottom: 16,
        }}>
          {copy.footerLinks}
        </div>
        <nav aria-label="Footer app links" style={{ display: 'grid', gap: 10 }}>
          {APPS.map(app => (
            <a
              key={app.id}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 14,
                color: 'var(--ink2)',
                transition: 'color 0.2s, transform 0.2s',
                display: 'inline-block',
                width: 'fit-content',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--accent)';
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--ink2)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              {app.name} ↗
            </a>
          ))}
        </nav>
      </div>

      {/* contact links */}
      <div>
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          letterSpacing: '0.22em',
          color: 'var(--accent)',
          opacity: 0.85,
          marginBottom: 16,
        }}>
          CONNECT
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          <a href="mailto:gonibauti@gmail.com" style={{ fontSize: 14, color: 'var(--ink2)' }}
             onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
             onMouseLeave={e => e.currentTarget.style.color = 'var(--ink2)'}
          >
            gonibauti@gmail.com
          </a>
          <a href="#contact" style={{ fontSize: 14, color: 'var(--ink2)' }}
             onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
             onMouseLeave={e => e.currentTarget.style.color = 'var(--ink2)'}
          >
            {copy.contactMe}
          </a>
          <a href="#hero" style={{ fontSize: 14, color: 'var(--ink2)' }}
             onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
             onMouseLeave={e => e.currentTarget.style.color = 'var(--ink2)'}
          >
            ↑ Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
