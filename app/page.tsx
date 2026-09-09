'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Bot, Check, ChevronRight, Command, GitBranch, Globe2, Layers3, Play, Sparkles, Zap } from 'lucide-react';
import { BlackstarStudio } from '@/components/BlackstarStudio';

const features = [
  { icon: GitBranch, title: 'Visual workflows', text: 'Compose automations as a calm, visual graph instead of a wall of code.' },
  { icon: Bot, title: 'Real AI models', text: 'Connect Gemma 4 and other Hugging Face models through one clean AI layer.' },
  { icon: Zap, title: 'Run instantly', text: 'Validate, execute and inspect every step from one focused workspace.' },
];

function LandingPage({ onOpen }: { onOpen: () => void }) {
  return (
    <main className="landing-shell">
      <div className="landing-orb orb-one" />
      <div className="landing-orb orb-two" />
      <nav className="landing-nav">
        <button className="brand-lockup" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="brand-mark"><Sparkles size={15} /></span>
          <span>BLACKSTAR</span>
        </button>
        <div className="landing-links">
          <a href="#product">Product</a>
          <a href="#workflow">Workflow</a>
          <a href="#models">Models</a>
        </div>
        <button className="nav-cta" onClick={onOpen}>Open studio <ArrowRight size={14} /></button>
      </nav>

      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot" /> AI workflow studio <span className="eyebrow-divider" /> built for Vercel</div>
          <h1>Build intelligent workflows <span>that feel effortless.</span></h1>
          <p>Blackstar is a visual AI automation studio for designing, connecting and running workflows with real models — without managing a separate backend.</p>
          <div className="hero-actions">
            <button className="hero-primary" onClick={onOpen}>Start building <ArrowRight size={16} /></button>
            <a className="hero-secondary" href="#workflow"><Play size={14} /> See how it works</a>
          </div>
          <div className="hero-trust"><Check size={13} /> Vercel-friendly <Check size={13} /> Browser-first storage <Check size={13} /> Open model ready</div>
        </div>

        <div className="hero-visual" id="workflow">
          <div className="hero-window">
            <div className="window-top"><div className="window-dots"><i /><i /><i /></div><span>blackstar / customer-intelligence</span><span className="window-status"><span className="live-dot" /> Ready</span></div>
            <div className="window-canvas">
              <div className="canvas-grid-fade" />
              <div className="demo-node demo-trigger"><span className="node-icon amber">⚡</span><div><b>Customer input</b><small>Trigger</small></div></div>
              <div className="demo-line line-a" />
              <div className="demo-node demo-ai"><span className="node-icon violet">✺</span><div><b>Gemma 4</b><small>AI Copilot · classify</small></div><span className="node-pulse" /></div>
              <div className="demo-line line-b" />
              <div className="demo-node demo-http"><span className="node-icon blue">↗</span><div><b>Notify API</b><small>HTTP Request</small></div></div>
              <div className="demo-chip chip-one"><Sparkles size={12} /> AI reasoning</div>
              <div className="demo-chip chip-two"><Check size={12} /> 1.82s execution</div>
            </div>
          </div>
          <div className="hero-glow-card"><span>01</span><div><b>Design once.</b><small>Run anywhere.</small></div></div>
        </div>
      </section>

      <section className="logo-strip"><span>DESIGNED FOR MODERN AI BUILDERS</span><div><b>GEMMA</b><b>HUGGING FACE</b><b>VERCEL</b><b>REACT FLOW</b></div></section>

      <section className="feature-section" id="product">
        <div className="section-heading"><span className="section-kicker">A quieter way to automate</span><h2>Powerful under the surface.<br /><span>Beautiful on the surface.</span></h2><p>Every part of Blackstar is designed to keep complexity close, while keeping your workflow clear.</p></div>
        <div className="feature-grid">{features.map(({ icon: Icon, title, text }) => <article className="feature-card" key={title}><div className="feature-icon"><Icon size={18} /></div><h3>{title}</h3><p>{text}</p><span className="card-arrow"><ArrowRight size={14} /></span></article>)}</div>
      </section>

      <section className="model-section" id="models">
        <div className="model-copy"><span className="section-kicker">Your model, your choice</span><h2>Switch intelligence<br /><span>without rebuilding.</span></h2><p>Use Gemma 4 through Hugging Face, choose another compatible model, or point Blackstar at a local OpenAI-compatible runtime when you are developing locally.</p><button className="text-button" onClick={onOpen}>Explore the studio <ChevronRight size={15} /></button></div>
        <div className="model-stack"><div className="model-card active"><div className="model-avatar">G</div><div><b>Gemma 4</b><small>Google · multimodal</small></div><span className="model-badge">Connected</span></div><div className="model-card"><div className="model-avatar hf">H</div><div><b>Hugging Face</b><small>Inference Providers</small></div><span className="model-badge muted">Cloud</span></div><div className="model-card"><div className="model-avatar local">⌁</div><div><b>Local runtime</b><small>Ollama · vLLM · compatible APIs</small></div><span className="model-badge muted">Local</span></div></div>
      </section>

      <section className="final-cta"><div className="final-cta-glow" /><div><span className="section-kicker">Ready when you are</span><h2>Make the workflow<br /><span>the product.</span></h2></div><button className="hero-primary" onClick={onOpen}>Enter Blackstar <ArrowRight size={16} /></button></section>

      <footer className="landing-footer"><div className="brand-lockup"><span className="brand-mark"><Sparkles size={14} /></span><span>BLACKSTAR</span></div><span>AI workflow studio · Vercel ready</span><div><Command size={13} /> <span>Built for builders</span></div></footer>
    </main>
  );
}

export default function Page() {
  const [studio, setStudio] = useState(false);

  useEffect(() => {
    const sync = () => setStudio(window.location.hash === '#studio');
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  const openStudio = () => {
    window.history.replaceState(null, '', '#studio');
    setStudio(true);
    window.scrollTo(0, 0);
  };

  if (studio) return <BlackstarStudio onBack={() => { window.history.replaceState(null, '', window.location.pathname); setStudio(false); }} />;
  return <LandingPage onOpen={openStudio} />;
}
