import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

export default function Contact({ copy }) {
  const sectionRef = useRef(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const anims = Array.from(el.querySelectorAll('.contact-anim'));
    gsap.set(anims, { opacity: 0, y: 40 });

    const tweens = [];
    const observer = new IntersectionObserver(
      entries => {
        if (!entries[0].isIntersecting) return;
        tweens.push(
          gsap.to(anims, { opacity: 1, y: 0, stagger: 0.1, duration: 0.9, ease: 'expo.out' })
        );
        observer.disconnect();
      },
      { threshold: 0.1 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      tweens.forEach(t => t.kill());
      gsap.set(anims, { clearProps: 'all' });
    };
  }, []);

  function onSubmit(e) {
    e.preventDefault();
    const subject = encodeURIComponent(`BauHub — message from ${name || 'someone'}`);
    const body = encodeURIComponent(`${msg}\n\n— ${name}\n${email}`);
    window.location.href = `mailto:gonibauti@gmail.com?subject=${subject}&body=${body}`;
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  }

  return (
    <section
      id="contact"
      ref={sectionRef}
      aria-label="Contact"
      style={{
        position: 'relative',
        zIndex: 1,
        padding: 'clamp(100px,12vw,180px) clamp(20px,5vw,80px)',
        maxWidth: 980,
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* divider */}
      <div className="contact-anim" style={{
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        marginBottom: 28,
        justifyContent: 'center',
      }}>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(61,183,255,0.3))' }} />
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          letterSpacing: '0.28em',
          color: 'var(--accent)',
          opacity: 0.85,
        }}>
          CONTACT
        </div>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(61,183,255,0.3))' }} />
      </div>

      <h2 className="contact-anim" style={{
        fontFamily: 'var(--display)',
        fontWeight: 800,
        fontSize: 'clamp(44px,7vw,92px)',
        letterSpacing: '-0.03em',
        lineHeight: 1,
        color: 'var(--ink)',
        marginBottom: 18,
        textAlign: 'center',
      }}>
        {copy.contactHeader}
        <span style={{ color: 'var(--accent)' }}>.</span>
      </h2>

      <p className="contact-anim" style={{
        fontSize: 'clamp(15px, 1.4vw, 18px)',
        color: 'var(--ink2)',
        marginBottom: 48,
        lineHeight: 1.55,
        textAlign: 'center',
        maxWidth: 560,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        {copy.contactSub}
      </p>

      {/* buttons row */}
      <div className="contact-anim" style={{
        display: 'flex',
        gap: 14,
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: 56,
      }}>
        <ContactBtn
          href="mailto:gonibauti@gmail.com"
          primary
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m22 7-10 7L2 7"/>
            </svg>
          }
        >
          {copy.emailBtn}
        </ContactBtn>

        <ContactBtn
          href="https://wa.me/message/PLACEHOLDER"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
          }
        >
          {copy.whatsappBtn}
        </ContactBtn>
      </div>

      {/* form */}
      <form
        className="contact-anim"
        onSubmit={onSubmit}
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24,
          padding: 'clamp(24px, 4vw, 40px)',
          display: 'grid',
          gap: 16,
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <Field
            label={copy.formName}
            value={name}
            onChange={setName}
            type="text"
            required
          />
          <Field
            label={copy.formEmail}
            value={email}
            onChange={setEmail}
            type="email"
            required
          />
        </div>
        <Field
          label={copy.formMessage}
          value={msg}
          onChange={setMsg}
          type="textarea"
          required
        />
        <button
          type="submit"
          style={{
            justifySelf: 'start',
            marginTop: 8,
            padding: '14px 28px',
            borderRadius: 999,
            fontSize: 14.5,
            fontWeight: 600,
            background: 'linear-gradient(135deg, #3DB7FF 0%, #67D6FF 100%)',
            color: '#02101E',
            border: '1px solid rgba(255,255,255,0.4)',
            boxShadow: '0 8px 32px rgba(61,183,255,0.42), inset 0 1px 0 rgba(255,255,255,0.4)',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.025)';
            e.currentTarget.style.boxShadow = '0 14px 50px rgba(61,183,255,0.7), inset 0 1px 0 rgba(255,255,255,0.5)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(61,183,255,0.42), inset 0 1px 0 rgba(255,255,255,0.4)';
          }}
        >
          {sent ? '✓ ' : ''}{copy.formSend}
          <span style={{ fontSize: 16 }}>→</span>
        </button>
      </form>
    </section>
  );
}

function Field({ label, value, onChange, type, required }) {
  const isArea = type === 'textarea';
  const Tag = isArea ? 'textarea' : 'input';
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{
        fontFamily: 'var(--mono)',
        fontSize: 11,
        letterSpacing: '0.18em',
        color: 'var(--ink3)',
        textTransform: 'uppercase',
      }}>
        {label}
      </span>
      <Tag
        value={value}
        onChange={e => onChange(e.target.value)}
        type={isArea ? undefined : type}
        required={required}
        rows={isArea ? 4 : undefined}
        style={{
          width: '100%',
          background: 'rgba(0,0,0,0.35)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12,
          padding: '14px 16px',
          fontFamily: 'var(--display)',
          fontSize: 15,
          color: 'var(--ink)',
          outline: 'none',
          resize: isArea ? 'vertical' : undefined,
          transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
        }}
        onFocus={e => {
          e.currentTarget.style.borderColor = 'rgba(61,183,255,0.55)';
          e.currentTarget.style.background = 'rgba(61,183,255,0.04)';
          e.currentTarget.style.boxShadow = '0 0 0 4px rgba(61,183,255,0.08)';
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
          e.currentTarget.style.background = 'rgba(0,0,0,0.35)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
    </label>
  );
}

function ContactBtn({ href, children, primary = false, icon }) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '14px 30px',
        borderRadius: 999,
        fontSize: 14.5,
        fontWeight: 600,
        background: primary
          ? 'linear-gradient(135deg, #3DB7FF 0%, #67D6FF 100%)'
          : 'rgba(255,255,255,0.03)',
        color: primary ? '#02101E' : 'var(--ink)',
        border: primary ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.14)',
        backdropFilter: primary ? 'none' : 'blur(10px)',
        WebkitBackdropFilter: primary ? 'none' : 'blur(10px)',
        boxShadow: primary
          ? '0 8px 32px rgba(61,183,255,0.42), inset 0 1px 0 rgba(255,255,255,0.4)'
          : '0 4px 18px rgba(0,0,0,0.3)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s, background 0.25s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px) scale(1.04)';
        if (primary) {
          e.currentTarget.style.boxShadow = '0 14px 50px rgba(61,183,255,0.7), inset 0 1px 0 rgba(255,255,255,0.5)';
        } else {
          e.currentTarget.style.borderColor = 'rgba(61,183,255,0.5)';
          e.currentTarget.style.background = 'rgba(61,183,255,0.08)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        if (primary) {
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(61,183,255,0.42), inset 0 1px 0 rgba(255,255,255,0.4)';
        } else {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
        }
      }}
    >
      {icon}
      {children}
    </a>
  );
}
