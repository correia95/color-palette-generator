import { useEffect, useMemo, useState } from 'react';
import { SCHEMES, Scheme, bestTextOn, normalizeHex, palette, randomHex } from './color';

function read() {
  try {
    const p = new URLSearchParams(window.location.search);
    const c = normalizeHex(p.get('c') || '') || '#4f7cf7';
    const s = (SCHEMES.some((x) => x.id === p.get('s')) ? p.get('s') : 'analogous') as Scheme;
    return { base: c, scheme: s };
  } catch {
    return { base: '#4f7cf7', scheme: 'analogous' as Scheme };
  }
}

export default function App() {
  const init = read();
  const [base, setBase] = useState(init.base);
  const [hexInput, setHexInput] = useState(init.base);
  const [scheme, setScheme] = useState<Scheme>(init.scheme);
  const [copied, setCopied] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const colors = useMemo(() => palette(base, scheme), [base, scheme]);

  useEffect(() => {
    try {
      const u = new URL(window.location.href);
      u.searchParams.set('c', base.replace('#', ''));
      u.searchParams.set('s', scheme);
      window.history.replaceState(null, '', u.toString());
    } catch {
      /* ignore */
    }
  }, [base, scheme]);

  const applyHex = (text: string) => {
    setHexInput(text);
    const n = normalizeHex(text);
    if (n) setBase(n);
  };

  const setColor = (hex: string) => {
    setBase(hex);
    setHexInput(hex);
  };

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1200);
    } catch {
      /* ignore */
    }
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(colors.join(', '));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1400);
    } catch {
      /* ignore */
    }
  };

  const schemeMeta = SCHEMES.find((s) => s.id === scheme)!;

  return (
    <div className="app">
      <header>
        <h1>Colour Palette Generator</h1>
        <p className="tag">
          Pick a colour, choose a harmony, get a five-colour palette. Click any swatch to copy its
          hex. The whole palette lives in the page link so you can share it.
        </p>
      </header>

      <div className="controls">
        <label className="picker" style={{ background: base }}>
          <input type="color" value={base} onChange={(e) => setColor(e.target.value)} aria-label="Base colour" />
        </label>
        <input
          className="hex"
          type="text"
          value={hexInput}
          spellCheck={false}
          onChange={(e) => applyHex(e.target.value)}
          aria-label="Base colour hex"
        />
        <button className="dice" onClick={() => setColor(randomHex())} aria-label="Random colour">Random</button>
      </div>

      <div className="schemes">
        {SCHEMES.map((s) => (
          <button key={s.id} className={s.id === scheme ? 'on' : ''} onClick={() => setScheme(s.id)}>
            {s.name}
          </button>
        ))}
      </div>
      <p className="schemenote">{schemeMeta.note}</p>

      <div className="palette">
        {colors.map((hex, i) => {
          const fg = bestTextOn(hex);
          return (
            <button
              key={i}
              className="swatch"
              style={{ background: hex, color: fg }}
              onClick={() => copy(hex, `${i}`)}
            >
              <span className="code">{hex.toUpperCase()}</span>
              <span className="act">{copied === `${i}` ? 'Copied' : 'Copy'}</span>
            </button>
          );
        })}
      </div>

      <button className="copyall" onClick={copyAll}>{copiedAll ? 'All copied' : 'Copy all hex codes'}</button>

      <section className="explainer">
        <h2>Colour harmonies</h2>
        <p>
          These schemes come from positions on the colour wheel. <strong>Analogous</strong> colours
          sit next to each other and feel calm and unified — good for backgrounds and gentle UIs.
          <strong> Complementary</strong> colours are opposite each other for maximum contrast — use
          the second colour sparingly, as an accent. <strong>Triadic</strong> takes three evenly
          spaced hues for something balanced but lively. <strong>Tetradic</strong> uses two
          complementary pairs; it gives you a lot to work with but needs one colour to dominate.
        </p>
        <h3>Monochrome, tints and shades</h3>
        <p>
          <strong>Monochrome</strong> keeps one hue and varies lightness and saturation — reliable
          and elegant. <strong>Tints &amp; shades</strong> stretches a single colour from almost
          white to almost black, which is what you want for a full UI scale (backgrounds, borders,
          text, buttons all from one family).
        </p>
        <h3>Contrast</h3>
        <p>
          The label on each swatch is black or white, whichever the browser calculates as more
          readable against that colour. For text that must meet accessibility standards, check the
          exact ratio with a dedicated
          <a href="https://contrast-checker.correia95.workers.dev/"> contrast checker</a>.
        </p>
        <h3>Is anything sent to a server?</h3>
        <p>No. The palette is generated in your browser and stored only in the page link.</p>
        <footer>Colour Palette Generator · no sign-up · works offline once loaded</footer>
      </section>
    </div>
  );
}
