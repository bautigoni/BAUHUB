import { useState } from 'react';
import { COPY } from './data.js';
import Nav from './components/Nav.jsx';
import Hero from './components/Hero.jsx';
import AppsSection from './components/AppsSection.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import Particles from './components/Particles.jsx';
import MeshBackground from './components/MeshBackground.jsx';
import CursorGlow from './components/CursorGlow.jsx';

export default function App() {
  const [lang, setLang] = useState('es');
  const copy = COPY[lang];

  return (
    <>
      <MeshBackground />
      <CursorGlow />
      <Particles />
      <Nav copy={copy} lang={lang} onLangToggle={() => setLang(l => l === 'en' ? 'es' : 'en')} />
      <main>
        <Hero copy={copy} />
        <AppsSection copy={copy} lang={lang} />
        <Contact copy={copy} />
      </main>
      <Footer copy={copy} />
    </>
  );
}
