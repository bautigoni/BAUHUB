// wireframes.jsx — 4 landing-page directions for BauHub
// All rendered as sketchy low-fi wireframes on a dark canvas to preview
// the eventual dark-futuristic aesthetic without committing to polish.

const { useState, useEffect, useMemo, useRef } = React;

// ---------- shared content ----------

const APPS = [
  {
    id: "techasset",
    name: "Techasset",
    url: "https://techasset.bauhub.online",
    en: { tag: "Operations",  desc: "School fleet & operations — track classroom status, inventory, tasks, loans and scheduling." },
    es: { tag: "Operaciones",  desc: "Flota y operaciones escolares — estado de aulas, inventario, tareas, préstamos y horarios." },
  },
  {
    id: "horaria",
    name: "Horaria",
    url: "https://horaria.bauhub.online",
    en: { tag: "Scheduling",   desc: "Conflict-free school timetables. Teachers, classes and classrooms — automatic." },
    es: { tag: "Horarios",     desc: "Horarios escolares sin conflictos. Docentes, clases y aulas — automático." },
  },
  {
    id: "checkinout",
    name: "Checkinout",
    url: "https://checkinout.bauhub.online",
    en: { tag: "Access",       desc: "Visitor check-in & check-out. Simple, secure entrance and exit flows." },
    es: { tag: "Acceso",       desc: "Registro de visitantes — flujos de entrada y salida simples y seguros." },
  },
  {
    id: "nexo",
    name: "NexoEscolar",
    url: "https://nexoescolar.bauhub.online",
    en: { tag: "Permissions",  desc: "Family authorizations made effortless — schools save hours every week." },
    es: { tag: "Permisos",     desc: "Autorizaciones familiares sin esfuerzo — escuelas que ahorran horas cada semana." },
  },
  {
    id: "fugas",
    name: "Fuga$",
    url: "https://fugas.bauhub.online",
    en: { tag: "Finance",      desc: "Personal finance that makes sense — clear analytics and better decisions." },
    es: { tag: "Finanzas",     desc: "Finanzas personales claras — analítica útil y mejores decisiones." },
  },
];

const COPY = {
  en: {
    nav: ["Home", "Apps", "About", "Contact"],
    exploreApps: "Explore apps",
    contactMe: "Contact me",
    openApp: "Open app",
    email: "Email",
    whatsapp: "WhatsApp",
    appsHeader: "The apps",
    contactHeader: "Let's talk",
    contactSub: "Custom apps · consulting · collaboration",
    footer: "© 2026 BauHub — practical software, quietly built",
    why: "A hub of educational & productivity apps, built for the work I care about.",
    manifestos: {
      monolith: "Software, quietly engineered.",
      constellation: "Five tools. One orbit.",
      bento: "Practical software for schools and life.",
      editorial: "Apps I build for the work I care about.",
    },
    subheads: {
      monolith: "A hub of useful educational and productivity tools — one ecosystem, five focused apps.",
      constellation: "BauHub connects the daily software of schools, families and personal life.",
      bento: "BauHub centralizes practical digital tools — for education, school management and productivity.",
      editorial: "Tools that give schools their time back, plus a few I built for myself.",
    },
  },
  es: {
    nav: ["Inicio", "Apps", "Sobre", "Contacto"],
    exploreApps: "Explorar apps",
    contactMe: "Contactarme",
    openApp: "Abrir app",
    email: "Correo",
    whatsapp: "WhatsApp",
    appsHeader: "Las apps",
    contactHeader: "Hablemos",
    contactSub: "Apps a medida · consultoría · colaboración",
    footer: "© 2026 BauHub — software práctico, hecho con calma",
    why: "Un hub de apps educativas y de productividad, hechas para el trabajo que me importa.",
    manifestos: {
      monolith: "Software, en silencio.",
      constellation: "Cinco herramientas. Una órbita.",
      bento: "Software práctico para escuelas y vida diaria.",
      editorial: "Apps que construyo para el trabajo que me importa.",
    },
    subheads: {
      monolith: "Un hub de herramientas educativas y de productividad — un ecosistema, cinco apps enfocadas.",
      constellation: "BauHub conecta el software diario de escuelas, familias y vida personal.",
      bento: "BauHub centraliza herramientas digitales prácticas — educación, gestión escolar y productividad.",
      editorial: "Herramientas que devuelven tiempo a las escuelas, y otras que hice para mí.",
    },
  },
};

// ---------- sketch primitives ----------

// Slightly wavy line — pure SVG. Used for hand-drawn dividers, underlines.
function ScribbleLine({ width = 200, height = 8, stroke = "currentColor", strokeWidth = 1.5, jitter = 1.2 }) {
  const path = useMemo(() => {
    const steps = Math.max(6, Math.floor(width / 20));
    let d = `M 2 ${height / 2}`;
    for (let i = 1; i <= steps; i++) {
      const x = 2 + ((width - 4) * i) / steps;
      const y = height / 2 + (Math.sin(i * 2.7 + width * 0.13) * jitter);
      d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return d;
  }, [width, height, jitter]);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      <path d={path} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

// A box that looks hand-drawn (rough corners, optional fill, optional dashed)
function SketchBox({
  width, height,
  fill = "transparent",
  stroke = "rgba(255,255,255,0.55)",
  strokeWidth = 1.2,
  dashed = false,
  rough = 1.2,
  children,
  style,
  onClick,
  accent = false,
  glow = false,
}) {
  const id = useMemo(() => "sb_" + Math.random().toString(36).slice(2, 8), []);
  const path = useMemo(() => {
    // Build a closed quad with a few jitters per side
    const w = width, h = height;
    const j = (k = 1) => (Math.sin(k * 7.3 + w * 0.11 + h * 0.07) * rough);
    const top    = `M ${2 + j(1)} ${2 + j(2)} L ${w/3 + j(3)} ${1 + j(4)} L ${2*w/3 + j(5)} ${3 + j(6)} L ${w-2 + j(7)} ${2 + j(8)}`;
    const right  = ` L ${w-1 + j(9)} ${h/3 + j(10)} L ${w-3 + j(11)} ${2*h/3 + j(12)} L ${w-2 + j(13)} ${h-2 + j(14)}`;
    const bottom = ` L ${2*w/3 + j(15)} ${h-1 + j(16)} L ${w/3 + j(17)} ${h-3 + j(18)} L ${2 + j(19)} ${h-2 + j(20)}`;
    const left   = ` L ${3 + j(21)} ${2*h/3 + j(22)} L ${1 + j(23)} ${h/3 + j(24)} Z`;
    return top + right + bottom + left;
  }, [width, height, rough]);
  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
      onClick={onClick}
    >
      <svg
        width={width} height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{
          position: "absolute", inset: 0,
          filter: glow ? `drop-shadow(0 0 8px ${stroke})` : undefined,
        }}
      >
        <path
          d={path}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={dashed ? "5 4" : undefined}
        />
      </svg>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>{children}</div>
    </div>
  );
}

// Image placeholder — dashed box with X and a label
function ImgPlaceholder({ width, height, label = "image", stroke = "rgba(255,255,255,0.35)" }) {
  return (
    <div style={{ position: "relative", width, height }}>
      <SketchBox width={width} height={height} dashed stroke={stroke} strokeWidth={1}>
        <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
          <line x1="4" y1="4" x2={width - 4} y2={height - 4} stroke={stroke} strokeWidth="1" strokeDasharray="4 4" />
          <line x1={width - 4} y1="4" x2="4" y2={height - 4} stroke={stroke} strokeWidth="1" strokeDasharray="4 4" />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--mono)", fontSize: 11, letterSpacing: 0.5,
          color: stroke, textTransform: "uppercase",
        }}>
          [ {label} ]
        </div>
      </SketchBox>
    </div>
  );
}

// Sketchy button (rounded pill)
function SketchBtn({ label, primary = false, accent, width = 160, height = 44, icon }) {
  return (
    <div style={{
      position: "relative", width, height,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      gap: 8,
      fontFamily: "var(--hand)", fontSize: 17,
      color: primary ? "#0a0a0a" : "#fff",
      letterSpacing: 0.3,
    }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
        <rect
          x="2" y="2" width={width - 4} height={height - 4}
          rx={height / 2} ry={height / 2}
          fill={primary ? accent : "transparent"}
          stroke={primary ? accent : "rgba(255,255,255,0.6)"}
          strokeWidth="1.4"
          style={{ filter: primary ? `drop-shadow(0 0 12px ${accent})` : undefined }}
        />
      </svg>
      <span style={{ position: "relative" }}>{icon}{label}</span>
    </div>
  );
}

// Annotation arrow + text (designer's marginal note)
function Note({ children, x, y, w = 180, arrow = null, color = "rgba(255, 220, 130, 0.95)" }) {
  return (
    <div style={{
      position: "absolute", left: x, top: y, width: w,
      fontFamily: "var(--hand)", fontSize: 13, lineHeight: 1.3,
      color, transform: "rotate(-1.2deg)", pointerEvents: "none",
    }}>
      <div style={{
        background: "rgba(40, 32, 12, 0.6)",
        border: `1px dashed ${color}`,
        padding: "5px 8px",
        borderRadius: 3,
      }}>
        {children}
      </div>
      {arrow}
    </div>
  );
}

// Section divider
function SectionDivider({ label, width = 1180 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: 0.5, margin: "0 50px", paddingTop: 40 }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#fff", letterSpacing: 2 }}>
        {label}
      </div>
      <div style={{ flex: 1, color: "rgba(255,255,255,0.4)" }}>
        <ScribbleLine width={width - 100} height={4} />
      </div>
    </div>
  );
}

// ---------- the 4 wireframe directions ----------
// each renders into an artboard ~ 1280 wide

const ARTBOARD_W = 1280;

// shared dimensions/colors for canvas
const C = {
  bg: "#0b0b0d",
  bg2: "#111114",
  ink: "rgba(255,255,255,0.85)",
  ink2: "rgba(255,255,255,0.55)",
  ink3: "rgba(255,255,255,0.32)",
};

// ============================================================
// DIRECTION 1 — MONOLITH
// Wordmark: BAUHUB (monumental uppercase)
// Accent: cyan
// Hero: huge centered orb
// Apps: full-bleed scroll chapters, big 01-05 numbers
// ============================================================

function DirMonolith({ lang, accent = "#4be3ff" }) {
  const t = COPY[lang];
  return (
    <div style={{
      width: ARTBOARD_W, background: C.bg, color: C.ink,
      fontFamily: "var(--hand)", position: "relative", overflow: "hidden",
    }}>
      {/* faint radial glow */}
      <div style={{
        position: "absolute", left: ARTBOARD_W / 2 - 600, top: 100, width: 1200, height: 1200,
        background: `radial-gradient(circle at center, ${accent}33 0%, transparent 60%)`,
        pointerEvents: "none", filter: "blur(20px)",
      }} />

      {/* viewport guide ribbon */}
      <ViewportLabel y={32} label="viewport · 1280" />

      {/* hidden-until-scroll nav cue */}
      <div style={{ position: "absolute", left: 50, top: 70, fontFamily: "var(--mono)", fontSize: 10, color: C.ink3 }}>
        (nav appears after 200px scroll →)
      </div>

      {/* HERO */}
      <div style={{ position: "relative", padding: "120px 80px 60px", textAlign: "center" }}>
        {/* wordmark */}
        <div style={{
          fontFamily: "var(--display)",
          fontWeight: 900, fontSize: 22, letterSpacing: 18, color: accent,
          textShadow: `0 0 14px ${accent}88`,
        }}>BAUHUB</div>

        {/* orb */}
        <div style={{ display: "flex", justifyContent: "center", margin: "40px 0 30px" }}>
          <Orb size={360} accent={accent} />
        </div>

        {/* headline */}
        <div style={{
          fontFamily: "var(--display)", fontSize: 76, lineHeight: 1, fontWeight: 800,
          letterSpacing: -2,
        }}>
          {t.manifestos.monolith}
        </div>
        <div style={{ marginTop: 22, fontSize: 19, color: C.ink2, maxWidth: 680, margin: "22px auto 0" }}>
          {t.subheads.monolith}
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 40 }}>
          <SketchBtn label={t.exploreApps} primary accent={accent} width={170} />
          <SketchBtn label={t.contactMe} width={150} />
        </div>

        <Note x={930} y={250} w={210}>
          <b>hero centerpiece:</b> WebGL/CSS orb, slow rotation,<br/>
          parallax on mouse move
        </Note>
        <Note x={70} y={520} w={200} color="rgba(170,220,255,0.9)">
          headline is the manifesto.<br/>weight 800, tight tracking
        </Note>
      </div>

      <SectionDivider label="/ APPS — SCROLL CHAPTERS" />

      {/* APPS — full-bleed chapters */}
      {APPS.map((app, i) => (
        <ChapterRow key={app.id} app={app} idx={i} lang={lang} accent={accent} />
      ))}

      <SectionDivider label="/ CONTACT" />

      {/* CONTACT */}
      <div style={{ padding: "120px 80px 80px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--display)", fontSize: 64, fontWeight: 800, letterSpacing: -1 }}>
          {t.contactHeader}<span style={{ color: accent }}>.</span>
        </div>
        <div style={{ marginTop: 14, fontSize: 17, color: C.ink2 }}>{t.contactSub}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 22, marginTop: 50 }}>
          <SketchBtn label={t.email} primary accent={accent} width={200} height={56} icon={<span style={{marginRight:8}}>✉</span>} />
          <SketchBtn label={t.whatsapp} width={200} height={56} icon={<span style={{marginRight:8}}>◉</span>} />
        </div>
      </div>

      <FooterRow lang={lang} accent={accent} />
    </div>
  );
}

function Orb({ size = 320, accent }) {
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {/* outer glow */}
      <div style={{
        position: "absolute", inset: -40,
        background: `radial-gradient(circle, ${accent}33 0%, transparent 65%)`,
        filter: "blur(20px)",
      }} />
      {/* sphere body */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: `radial-gradient(circle at 30% 28%, ${accent}cc 0%, ${accent}44 22%, #0b0b0d 68%)`,
        boxShadow: `inset -20px -30px 60px rgba(0,0,0,0.6), 0 0 60px ${accent}55`,
      }} />
      {/* sketchy outline */}
      <svg width={size} height={size} style={{ position: "absolute", inset: 0 }}>
        <circle cx={size/2} cy={size/2} r={size/2 - 4}
          fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="2 6" />
        <circle cx={size/2 - 30} cy={size/2 - 30} r={size/2 - 50}
          fill="none" stroke={accent} strokeWidth="1" strokeOpacity="0.55" />
      </svg>
      {/* label */}
      <div style={{
        position: "absolute", left: "50%", bottom: -28, transform: "translateX(-50%)",
        fontFamily: "var(--mono)", fontSize: 10, color: "rgba(255,255,255,0.45)", letterSpacing: 2,
      }}>[ 3D ORB · WEBGL ]</div>
    </div>
  );
}

function ChapterRow({ app, idx, lang, accent }) {
  const t = COPY[lang];
  const flip = idx % 2 === 1;
  return (
    <div style={{
      position: "relative", padding: "90px 80px",
      display: "flex", flexDirection: flip ? "row-reverse" : "row",
      alignItems: "center", gap: 60,
    }}>
      {/* big index number */}
      <div style={{
        fontFamily: "var(--display)", fontSize: 220, lineHeight: 0.85, fontWeight: 900,
        color: "transparent", WebkitTextStroke: `1.5px ${accent}66`,
        flex: "0 0 auto",
      }}>
        {String(idx + 1).padStart(2, "0")}
      </div>

      <div style={{ flex: "1 1 auto", minWidth: 0 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: accent, letterSpacing: 3, marginBottom: 12 }}>
          {app[lang].tag.toUpperCase()}
        </div>
        <div style={{ fontFamily: "var(--display)", fontSize: 56, fontWeight: 800, letterSpacing: -1, marginBottom: 18 }}>
          {app.name}
        </div>
        <div style={{ fontSize: 17, color: C.ink2, maxWidth: 460, lineHeight: 1.5, marginBottom: 24 }}>
          {app[lang].desc}
        </div>
        <SketchBtn label={`${t.openApp} →`} accent={accent} width={150} />
      </div>

      <ImgPlaceholder width={360} height={240} label={`${app.name.toLowerCase()} mockup`} />

      {idx === 0 && (
        <Note x={flip ? 70 : 980} y={50} w={200}>
          each chapter reveals on scroll:<br/>
          number fades up, copy slides,<br/>mockup parallaxes
        </Note>
      )}
    </div>
  );
}

function FooterRow({ lang, accent }) {
  const t = COPY[lang];
  return (
    <div style={{
      borderTop: "1px solid rgba(255,255,255,0.08)",
      padding: "40px 80px 60px",
      display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 40,
    }}>
      <div>
        <div style={{
          fontFamily: "var(--display)", fontWeight: 900, fontSize: 24, letterSpacing: 6,
          color: accent, textShadow: `0 0 10px ${accent}66`,
        }}>BAUHUB</div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: C.ink3, marginTop: 8 }}>
          {t.footer}
        </div>
      </div>
      <div style={{ display: "flex", gap: 24 }}>
        {APPS.map(a => (
          <div key={a.id} style={{ fontSize: 13, color: C.ink2 }}>{a.name}</div>
        ))}
      </div>
    </div>
  );
}

function ViewportLabel({ y, label }) {
  return (
    <div style={{
      position: "absolute", right: 80, top: y,
      fontFamily: "var(--mono)", fontSize: 10, color: C.ink3, letterSpacing: 2,
    }}>
      {label}
    </div>
  );
}

// ============================================================
// DIRECTION 2 — CONSTELLATION
// Wordmark: bau·hub (lowercase with mid-dot)
// Accent: violet
// Hero: central node + 5 orbiting app nodes
// Apps below: each "node" expands into a row card
// ============================================================

function DirConstellation({ lang, accent = "#a78bff" }) {
  const t = COPY[lang];
  return (
    <div style={{
      width: ARTBOARD_W, background: C.bg, color: C.ink,
      fontFamily: "var(--hand)", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", left: 0, top: 0, right: 0, bottom: 0,
        backgroundImage: `radial-gradient(circle at 50% 600px, ${accent}22 0%, transparent 50%)`,
        pointerEvents: "none",
      }} />

      <ViewportLabel y={32} label="viewport · 1280" />
      <div style={{ position: "absolute", left: 50, top: 70, fontFamily: "var(--mono)", fontSize: 10, color: C.ink3 }}>
        (nav appears after scroll · floats as pill at top)
      </div>

      {/* HERO — constellation */}
      <div style={{ position: "relative", padding: "100px 60px 60px", textAlign: "center", height: 1080 }}>
        <div style={{
          fontFamily: "var(--mono)", fontWeight: 500,
          fontSize: 22, letterSpacing: 4, color: accent,
        }}>
          bau<span style={{ color: "#fff" }}>·</span>hub
        </div>

        <div style={{
          fontFamily: "var(--display)", fontSize: 64, lineHeight: 1.05, fontWeight: 700,
          letterSpacing: -1.5, marginTop: 40,
        }}>
          {t.manifestos.constellation}
        </div>
        <div style={{ marginTop: 20, fontSize: 18, color: C.ink2, maxWidth: 640, margin: "20px auto 0" }}>
          {t.subheads.constellation}
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 36 }}>
          <SketchBtn label={t.exploreApps} primary accent={accent} width={170} />
          <SketchBtn label={t.contactMe} width={150} />
        </div>

        {/* the constellation */}
        <Constellation accent={accent} />

        <Note x={70} y={490} w={200} color="rgba(200,170,255,0.95)">
          <b>hero:</b> central core, 5 satellite nodes (apps).<br/>
          Lines pulse. Hover a node → app preview pops.
        </Note>
        <Note x={1010} y={760} w={210} color="rgba(200,170,255,0.95)">
          slow rotation of whole constellation;<br/>
          subtle parallax on mouse move
        </Note>
      </div>

      <SectionDivider label="/ APPS — EXPANDED NODES" />

      {/* APPS as expanded node rows */}
      <div style={{ padding: "60px 80px 40px", display: "flex", flexDirection: "column", gap: 28 }}>
        {APPS.map((app, i) => (
          <NodeCard key={app.id} app={app} idx={i} lang={lang} accent={accent} />
        ))}
      </div>

      <SectionDivider label="/ CONTACT" />

      <div style={{ padding: "100px 80px 80px", display: "flex", alignItems: "center", gap: 60 }}>
        <div style={{ flex: "1 1 auto" }}>
          <div style={{ fontFamily: "var(--display)", fontSize: 60, fontWeight: 700, letterSpacing: -1 }}>
            {t.contactHeader}
          </div>
          <div style={{ marginTop: 14, fontSize: 17, color: C.ink2, maxWidth: 460 }}>
            {t.contactSub}
          </div>
          <div style={{ display: "flex", gap: 18, marginTop: 40 }}>
            <SketchBtn label={t.email} primary accent={accent} width={180} height={54} />
            <SketchBtn label={t.whatsapp} width={180} height={54} />
          </div>
        </div>
        <NodeMark size={220} accent={accent} pulse />
      </div>

      <FooterRow lang={lang} accent={accent} />
    </div>
  );
}

function Constellation({ accent }) {
  const cx = ARTBOARD_W / 2 - 60;
  const cy = 470;
  const r = 220;
  const positions = APPS.map((_, i) => {
    const a = (i / APPS.length) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) * 0.7 };
  });
  return (
    <svg width={ARTBOARD_W} height={680} style={{ position: "absolute", left: 0, top: 380, pointerEvents: "none" }}>
      {/* lines */}
      {positions.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y}
              stroke={accent} strokeOpacity="0.4" strokeWidth="1" strokeDasharray="2 4" />
      ))}
      {/* orbit ring */}
      <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.7} fill="none"
               stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="2 6" />
      {/* core */}
      <circle cx={cx} cy={cy} r="34" fill={`${accent}33`} stroke={accent} strokeWidth="1.4" />
      <circle cx={cx} cy={cy} r="10" fill={accent}
              style={{ filter: `drop-shadow(0 0 14px ${accent})` }} />
      <text x={cx} y={cy + 4} textAnchor="middle"
            style={{ fontFamily: "var(--mono)", fontSize: 9, fill: "#fff", letterSpacing: 2 }}>HUB</text>
      {/* satellite nodes */}
      {positions.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="22" fill={C.bg} stroke={accent} strokeWidth="1.4" />
          <circle cx={p.x} cy={p.y} r="22" fill={`${accent}22`} />
          <text x={p.x} y={p.y + 3} textAnchor="middle"
                style={{ fontFamily: "var(--mono)", fontSize: 9, fill: "#fff", letterSpacing: 1 }}>
            {APPS[i].name.slice(0, 4).toUpperCase()}
          </text>
        </g>
      ))}
    </svg>
  );
}

function NodeMark({ size = 100, accent, pulse = false }) {
  return (
    <div style={{ position: "relative", width: size, height: size, flex: "0 0 auto" }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={size/2 - 4} fill="none"
                stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeDasharray="2 6" />
        <circle cx={size/2} cy={size/2} r={size/3} fill={`${accent}22`} stroke={accent} strokeWidth="1.2" />
        <circle cx={size/2} cy={size/2} r={size/8} fill={accent}
                style={{ filter: `drop-shadow(0 0 14px ${accent})` }} />
      </svg>
      {pulse && (
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: `1px solid ${accent}55`,
        }} />
      )}
    </div>
  );
}

function NodeCard({ app, idx, lang, accent }) {
  const t = COPY[lang];
  return (
    <SketchBox width={1120} height={150} stroke="rgba(255,255,255,0.15)" rough={0.6}>
      <div style={{
        position: "relative", padding: "20px 28px", display: "flex", alignItems: "center", gap: 28, height: "100%",
      }}>
        <NodeMark size={90} accent={accent} />
        <div style={{ flex: "1 1 auto" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: accent, letterSpacing: 3, marginBottom: 6 }}>
            {String(idx + 1).padStart(2, "0")} · {app[lang].tag.toUpperCase()}
          </div>
          <div style={{ fontFamily: "var(--display)", fontSize: 32, fontWeight: 700, letterSpacing: -0.5, marginBottom: 6 }}>
            {app.name}
          </div>
          <div style={{ fontSize: 15, color: C.ink2, maxWidth: 600 }}>
            {app[lang].desc}
          </div>
        </div>
        <SketchBtn label={`${t.openApp} →`} accent={accent} width={150} />
      </div>
    </SketchBox>
  );
}

// ============================================================
// DIRECTION 3 — BENTO STACK
// Wordmark: BauHub (classic capitalized sans)
// Accent: electric blue
// Hero: headline + 3D floating glass cube
// Apps: bento grid (varied card sizes), mock screenshots inside
// ============================================================

function DirBento({ lang, accent = "#3b82f6" }) {
  const t = COPY[lang];
  return (
    <div style={{
      width: ARTBOARD_W, background: C.bg, color: C.ink,
      fontFamily: "var(--hand)", position: "relative", overflow: "hidden",
    }}>
      {/* grid bg hint */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.5,
        backgroundImage: `radial-gradient(circle at 80% 200px, ${accent}33 0%, transparent 45%)`,
        pointerEvents: "none",
      }} />

      <ViewportLabel y={32} label="viewport · 1280" />
      <div style={{ position: "absolute", left: 50, top: 70, fontFamily: "var(--mono)", fontSize: 10, color: C.ink3 }}>
        (nav: hidden until scroll → pill at top)
      </div>

      {/* HERO */}
      <div style={{ position: "relative", padding: "120px 80px 80px", display: "flex", alignItems: "center", gap: 60 }}>
        <div style={{ flex: "1 1 auto", maxWidth: 620 }}>
          <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 28, letterSpacing: -0.5 }}>
            Bau<span style={{ color: accent }}>Hub</span>
          </div>
          <div style={{
            marginTop: 40, fontFamily: "var(--display)", fontSize: 72, lineHeight: 1, fontWeight: 800,
            letterSpacing: -2,
          }}>
            {t.manifestos.bento}
          </div>
          <div style={{ marginTop: 22, fontSize: 18, color: C.ink2, maxWidth: 520, lineHeight: 1.5 }}>
            {t.subheads.bento}
          </div>
          <div style={{ display: "flex", gap: 18, marginTop: 36 }}>
            <SketchBtn label={t.exploreApps} primary accent={accent} width={170} />
            <SketchBtn label={t.contactMe} width={150} />
          </div>
        </div>
        <FloatingCube size={360} accent={accent} />
        <Note x={780} y={130} w={210}>
          <b>hero object:</b> glass cube (CSS 3D transforms).<br/>
          tilts on scroll, refraction lines on faces
        </Note>
      </div>

      <SectionDivider label="/ APPS — BENTO" />

      {/* BENTO GRID */}
      <div style={{ padding: "40px 80px 20px" }}>
        <BentoGrid lang={lang} accent={accent} />
      </div>

      <SectionDivider label="/ CONTACT" />

      <div style={{ padding: "120px 80px 80px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--display)", fontSize: 64, fontWeight: 800, letterSpacing: -1 }}>
          {t.contactHeader}
        </div>
        <div style={{ marginTop: 14, fontSize: 17, color: C.ink2 }}>{t.contactSub}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 22, marginTop: 50 }}>
          <SketchBtn label={t.email} primary accent={accent} width={200} height={56} />
          <SketchBtn label={t.whatsapp} width={200} height={56} />
        </div>
      </div>

      <FooterRow lang={lang} accent={accent} />
    </div>
  );
}

function FloatingCube({ size = 280, accent }) {
  return (
    <div style={{ position: "relative", width: size, height: size, flex: "0 0 auto" }}>
      <div style={{
        position: "absolute", inset: -30,
        background: `radial-gradient(circle, ${accent}33 0%, transparent 70%)`,
        filter: "blur(20px)",
      }} />
      <svg width={size} height={size} viewBox="0 0 200 200" style={{ position: "absolute", inset: 0 }}>
        {/* tilted cube */}
        <g transform="translate(100 110) rotate(-8)">
          {/* back faces */}
          <polygon points="-60,-70 60,-70 80,-50 -40,-50" fill={`${accent}22`} stroke={accent} strokeWidth="1.2"/>
          <polygon points="60,-70 80,-50 80,70 60,50" fill={`${accent}33`} stroke={accent} strokeWidth="1.2"/>
          <polygon points="-60,-70 -60,50 60,50 60,-70" fill={`${accent}11`} stroke={accent} strokeWidth="1.6"
                   style={{ filter: `drop-shadow(0 0 14px ${accent}88)` }}/>
          {/* refraction lines */}
          <line x1="-60" y1="-30" x2="60" y2="-30" stroke="rgba(255,255,255,0.3)" strokeDasharray="2 4"/>
          <line x1="-60" y1="10" x2="60" y2="10" stroke="rgba(255,255,255,0.3)" strokeDasharray="2 4"/>
          <line x1="-20" y1="-70" x2="-20" y2="50" stroke="rgba(255,255,255,0.3)" strokeDasharray="2 4"/>
          <line x1="20" y1="-70" x2="20" y2="50" stroke="rgba(255,255,255,0.3)" strokeDasharray="2 4"/>
        </g>
      </svg>
      <div style={{
        position: "absolute", left: "50%", bottom: -28, transform: "translateX(-50%)",
        fontFamily: "var(--mono)", fontSize: 10, color: "rgba(255,255,255,0.45)", letterSpacing: 2,
      }}>[ 3D GLASS CUBE ]</div>
    </div>
  );
}

function BentoGrid({ lang, accent }) {
  // Layout: 12-col grid, varied sizes
  // row1: big featured (8) | tall (4 spanning 2 rows)
  // row2: 4 | 4 | (tall continues)
  // row3: 6 | 6
  const t = COPY[lang];
  const Card = ({ app, span, tall, mockup }) => (
    <SketchBox
      width={span === "wide" ? 740 : span === "mid" ? 560 : span === "tall" ? 360 : 360}
      height={tall ? 480 : 280}
      stroke="rgba(255,255,255,0.18)" rough={0.7}
    >
      <div style={{ padding: "22px 24px", height: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: accent, letterSpacing: 3 }}>
            {app[lang].tag.toUpperCase()}
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: C.ink3 }}>↗</div>
        </div>
        <div style={{ fontFamily: "var(--display)", fontSize: span === "wide" ? 42 : 30, fontWeight: 700, letterSpacing: -0.5 }}>
          {app.name}
        </div>
        <div style={{ fontSize: 14, color: C.ink2, lineHeight: 1.45, maxWidth: 380 }}>
          {app[lang].desc}
        </div>
        <div style={{ marginTop: "auto" }}>
          <ImgPlaceholder
            width={span === "wide" ? 680 : tall ? 300 : 300}
            height={tall ? 200 : (span === "wide" ? 90 : 80)}
            label={mockup}
          />
        </div>
      </div>
    </SketchBox>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "flex", gap: 22 }}>
        <Card app={APPS[0]} span="wide" mockup="techasset dashboard" />
        <Card app={APPS[1]} span="tall" tall mockup="timetable grid" />
      </div>
      <div style={{ display: "flex", gap: 22 }}>
        <Card app={APPS[2]} span="mid" mockup="check-in flow" />
        <Card app={APPS[3]} mockup="permission form" />
      </div>
      <div style={{ display: "flex", gap: 22, justifyContent: "center" }}>
        <Card app={APPS[4]} span="mid" mockup="finance chart" />
        <SketchBox width={540} height={280} stroke="rgba(255,255,255,0.18)" rough={0.7}>
          <div style={{ padding: "22px 24px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: accent, letterSpacing: 3 }}>ECOSYSTEM</div>
            <div style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 700, marginTop: 10, maxWidth: 460 }}>
              {COPY[lang].why}
            </div>
          </div>
        </SketchBox>
      </div>
    </div>
  );
}

// ============================================================
// DIRECTION 4 — EDITORIAL
// Wordmark: bauhub (lowercase serif italic, technical)
// Accent: warm amber
// Hero: large left-aligned headline, small floating shape upper-right
// Apps: numbered chapters, asymmetric, big abstract symbols
// ============================================================

function DirEditorial({ lang, accent = "#f5b14f" }) {
  const t = COPY[lang];
  return (
    <div style={{
      width: ARTBOARD_W, background: C.bg, color: C.ink,
      fontFamily: "var(--hand)", position: "relative", overflow: "hidden",
    }}>
      <ViewportLabel y={32} label="viewport · 1280" />
      <div style={{ position: "absolute", left: 50, top: 70, fontFamily: "var(--mono)", fontSize: 10, color: C.ink3 }}>
        (nav: hidden, reveals minimal side dots on scroll)
      </div>

      {/* HERO — asymmetric editorial */}
      <div style={{ position: "relative", padding: "120px 80px 80px" }}>
        <div style={{
          fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 24,
          color: accent, letterSpacing: 0.5,
        }}>
          bauhub<span style={{ color: C.ink2 }}>.online</span>
        </div>

        {/* index */}
        <div style={{
          position: "absolute", right: 80, top: 130, fontFamily: "var(--mono)", fontSize: 10,
          color: C.ink3, letterSpacing: 2, textAlign: "right", lineHeight: 1.8,
        }}>
          INDEX<br/>
          00 — INTRO<br/>
          01 — TECHASSET<br/>
          02 — HORARIA<br/>
          03 — CHECKINOUT<br/>
          04 — NEXOESCOLAR<br/>
          05 — FUGA$<br/>
          06 — CONTACT
        </div>

        <div style={{ marginTop: 80, display: "flex", gap: 40 }}>
          <div style={{ flex: "0 0 80px", fontFamily: "var(--mono)", fontSize: 11, color: accent, letterSpacing: 3 }}>
            00<br/>—<br/>INTRO
          </div>
          <div style={{ flex: "1 1 auto", maxWidth: 800 }}>
            <div style={{
              fontFamily: "var(--serif)", fontSize: 84, lineHeight: 1.02, fontWeight: 500,
              letterSpacing: -2.5,
            }}>
              {t.manifestos.editorial.split(" ").map((w, i, arr) => (
                <span key={i} style={{ fontStyle: i === arr.length - 2 ? "italic" : "normal", color: i === arr.length - 1 ? accent : "inherit" }}>
                  {w}{i < arr.length - 1 ? " " : ""}
                </span>
              ))}
            </div>
            <div style={{ marginTop: 28, fontSize: 18, color: C.ink2, maxWidth: 540, lineHeight: 1.5 }}>
              {t.subheads.editorial}
            </div>
            <div style={{ display: "flex", gap: 18, marginTop: 36 }}>
              <SketchBtn label={t.exploreApps} primary accent={accent} width={170} />
              <SketchBtn label={t.contactMe} width={150} />
            </div>
          </div>
        </div>

        {/* small floating shape upper-right corner */}
        <div style={{ position: "absolute", right: 80, top: 320 }}>
          <FloatingDiamond size={150} accent={accent} />
        </div>
        <Note x={70} y={780} w={240} color="rgba(245,177,79,0.95)">
          <b>editorial vibe:</b> serif italic, asymmetric grid, index column.<br/>
          Each chapter is its own scroll spread.
        </Note>
      </div>

      <SectionDivider label="/ APPS — CHAPTERS" />

      {APPS.map((app, i) => (
        <EditorialChapter key={app.id} app={app} idx={i} lang={lang} accent={accent} />
      ))}

      <SectionDivider label="/ CONTACT" />

      <div style={{ padding: "120px 80px 80px" }}>
        <div style={{ display: "flex", gap: 40 }}>
          <div style={{ flex: "0 0 80px", fontFamily: "var(--mono)", fontSize: 11, color: accent, letterSpacing: 3 }}>
            06<br/>—<br/>{t.contactHeader.toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 90, fontWeight: 500, fontStyle: "italic", letterSpacing: -2, color: accent }}>
              say hi.
            </div>
            <div style={{ marginTop: 18, fontSize: 18, color: C.ink2, maxWidth: 520 }}>
              {t.contactSub}
            </div>
            <div style={{ display: "flex", gap: 22, marginTop: 40 }}>
              <SketchBtn label={`${t.email} →`} primary accent={accent} width={200} height={56} />
              <SketchBtn label={`${t.whatsapp} →`} width={200} height={56} />
            </div>
          </div>
        </div>
      </div>

      <FooterRow lang={lang} accent={accent} />
    </div>
  );
}

function FloatingDiamond({ size = 140, accent }) {
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <div style={{
        position: "absolute", inset: -20,
        background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
        filter: "blur(16px)",
      }} />
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", inset: 0 }}>
        <g transform="translate(50 50) rotate(8)">
          <polygon points="0,-38 28,0 0,38 -28,0" fill={`${accent}22`} stroke={accent} strokeWidth="1.2"
                   style={{ filter: `drop-shadow(0 0 8px ${accent})` }}/>
          <polygon points="0,-38 0,38" fill="none" stroke="rgba(255,255,255,0.3)" strokeDasharray="2 3"/>
          <polygon points="-28,0 28,0" fill="none" stroke="rgba(255,255,255,0.3)" strokeDasharray="2 3"/>
        </g>
      </svg>
      <div style={{
        position: "absolute", left: "50%", bottom: -22, transform: "translateX(-50%)",
        fontFamily: "var(--mono)", fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: 2,
      }}>[ DIAMOND ]</div>
    </div>
  );
}

function EditorialChapter({ app, idx, lang, accent }) {
  const t = COPY[lang];
  const flip = idx % 2 === 1;
  return (
    <div style={{
      padding: "90px 80px",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      display: "flex", gap: 40, flexDirection: flip ? "row-reverse" : "row",
    }}>
      <div style={{ flex: "0 0 80px", fontFamily: "var(--mono)", fontSize: 11, color: accent, letterSpacing: 3 }}>
        {String(idx + 1).padStart(2, "0")}<br/>—<br/>{app[lang].tag.toUpperCase()}
      </div>
      <div style={{ flex: "1 1 auto", maxWidth: 600 }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 64, fontWeight: 500, letterSpacing: -1.5, lineHeight: 1 }}>
          {app.name}
        </div>
        <div style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 22, color: C.ink2, marginTop: 16, lineHeight: 1.45, maxWidth: 480 }}>
          {app[lang].desc}
        </div>
        <div style={{ marginTop: 28, display: "flex", gap: 24, alignItems: "center" }}>
          <SketchBtn label={`${t.openApp} →`} accent={accent} width={150} />
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: C.ink3 }}>{app.url.replace("https://", "")}</div>
        </div>
      </div>
      <div style={{ flex: "0 0 auto" }}>
        <AbstractSymbol idx={idx} accent={accent} />
      </div>
    </div>
  );
}

// abstract geometric symbol per app — varies by index
function AbstractSymbol({ idx, accent }) {
  const size = 200;
  const variants = [
    // techasset — concentric squares
    (
      <g key="ta" transform="translate(100 100)">
        <rect x="-60" y="-60" width="120" height="120" fill="none" stroke={accent} strokeWidth="1.2" />
        <rect x="-40" y="-40" width="80" height="80" fill="none" stroke={accent} strokeWidth="1.2" opacity="0.7" />
        <rect x="-20" y="-20" width="40" height="40" fill={`${accent}33`} stroke={accent} strokeWidth="1.2" />
      </g>
    ),
    // horaria — grid of dots forming clock
    (
      <g key="hr" transform="translate(100 100)">
        <circle r="70" fill="none" stroke={accent} strokeWidth="1.2" />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <circle key={i} cx={Math.cos(a) * 60} cy={Math.sin(a) * 60} r="3" fill={accent} />;
        })}
        <line x1="0" y1="0" x2="0" y2="-40" stroke={accent} strokeWidth="2" />
        <line x1="0" y1="0" x2="30" y2="20" stroke={accent} strokeWidth="2" />
      </g>
    ),
    // checkinout — door / arrow
    (
      <g key="ci" transform="translate(100 100)">
        <rect x="-40" y="-60" width="80" height="120" fill="none" stroke={accent} strokeWidth="1.2" />
        <path d="M -15 0 L 20 0 M 5 -15 L 20 0 L 5 15" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round"/>
      </g>
    ),
    // nexo — connected nodes
    (
      <g key="nx" transform="translate(100 100)">
        {[[-40, -30], [40, -30], [0, 40]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="14" fill={`${accent}33`} stroke={accent} strokeWidth="1.4"/>
        ))}
        <line x1="-40" y1="-30" x2="40" y2="-30" stroke={accent} strokeDasharray="3 3" />
        <line x1="-40" y1="-30" x2="0" y2="40" stroke={accent} strokeDasharray="3 3" />
        <line x1="40" y1="-30" x2="0" y2="40" stroke={accent} strokeDasharray="3 3" />
      </g>
    ),
    // fugas — ascending bars / chart
    (
      <g key="fg" transform="translate(100 100)">
        <rect x="-60" y="-10" width="20" height="60" fill={`${accent}33`} stroke={accent} strokeWidth="1.2"/>
        <rect x="-30" y="-30" width="20" height="80" fill={`${accent}55`} stroke={accent} strokeWidth="1.2"/>
        <rect x="0" y="-50" width="20" height="100" fill={`${accent}77`} stroke={accent} strokeWidth="1.2"/>
        <rect x="30" y="-70" width="20" height="120" fill={`${accent}aa`} stroke={accent} strokeWidth="1.2"/>
        <text x="35" y="-78" style={{ fontFamily: "var(--mono)", fontSize: 14, fill: accent }}>$</text>
      </g>
    ),
  ];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {variants[idx % variants.length]}
    </svg>
  );
}

// expose to canvas file
Object.assign(window, {
  DirMonolith, DirConstellation, DirBento, DirEditorial,
  APPS, COPY,
});
