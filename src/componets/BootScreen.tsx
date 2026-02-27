import { useState, useEffect, useCallback } from 'react';

interface BootScreenProps {
  onBootComplete: () => void;
  minDuration?: number;
}

/* ──────────────────────────────────────────────
   IBM-style horizontal-stripe logo for "IM'os"
   Each letter is a 2-D boolean grid (8 rows).
   true = filled block, false = gap.
   Rows 1,3,5,7 are "stripe" rows – we keep them;
   Rows 0,2,4,6 are "gap" rows   – we blank them
   to produce the classic IBM horizontal-line look.
   ────────────────────────────────────────────── */

// prettier-ignore
const LETTER_I = [
  [true, true, true, true, true],
  [false,false,true, false,false],
  [false,false,true, false,false],
  [false,false,true, false,false],
  [false,false,true, false,false],
  [false,false,true, false,false],
  [false,false,true, false,false],
  [true, true, true, true, true],
];

// prettier-ignore
const LETTER_M = [
  [true, false,false,false,true ],
  [true, true, false,true, true ],
  [true, false,true, false,true ],
  [true, false,true, false,true ],
  [true, false,false,false,true ],
  [true, false,false,false,true ],
  [true, false,false,false,true ],
  [true, false,false,false,true ],
];

// prettier-ignore
const LETTER_APOS = [
  [true ],
  [true ],
  [false],
  [false],
  [false],
  [false],
  [false],
  [false],
];

// prettier-ignore
const LETTER_O_LOW = [
  [false,false,false,false,false],
  [false,false,false,false,false],
  [false,false,false,false,false],
  [false,true, true, true, false],
  [true, false,false,false,true ],
  [true, false,false,false,true ],
  [true, false,false,false,true ],
  [false,true, true, true, false],
];

// prettier-ignore
const LETTER_S_LOW = [
  [false,false,false,false,false],
  [false,false,false,false,false],
  [false,false,false,false,false],
  [false,true, true, true, true ],
  [true, false,false,false,false],
  [false,true, true, true, false],
  [false,false,false,false,true ],
  [true, true, true, true, false],
];

const LETTERS = [LETTER_I, LETTER_M, LETTER_APOS, LETTER_O_LOW, LETTER_S_LOW];
const STRIPE_ROWS = new Set([0, 2, 4, 6]); // rows that get horizontal line gaps

function IMosLogo({ visible }: { visible: boolean }) {
  return (
    <div
      className="flex flex-col items-center justify-center select-none transition-opacity duration-700"
      style={{ opacity: visible ? 1 : 0 }}
      aria-label="IM'os logo"
    >
      {/* Render 8 rows */}
      {Array.from({ length: 8 }).map((_, row) => (
        <div key={row} className="flex" style={{ height: row < 3 && LETTER_APOS[row][0] ? undefined : undefined }}>
          {LETTERS.map((letter, li) => (
            <span key={li} className="flex" style={{ marginRight: li < LETTERS.length - 1 ? (li === 2 ? '2px' : '10px') : '0' }}>
              {letter[row].map((filled, col) => {
                const isStripe = STRIPE_ROWS.has(row);
                const show = filled && !isStripe;
                return (
                  <span
                    key={col}
                    style={{
                      display: 'inline-block',
                      width: '10px',
                      height: '7px',
                      backgroundColor: show ? '#37ff14' : 'transparent',
                      boxShadow: show ? '0 0 6px rgba(55,255,20,0.4)' : 'none',
                    }}
                  />
                );
              })}
            </span>
          ))}
        </div>
      ))}

      {/* Tagline */}
      <p
        className="font-mono text-xs tracking-[0.35em] mt-5 uppercase"
        style={{ color: '#37ff14', opacity: 0.7 }}
      >
        Isaac Mora Operating System
      </p>
      <p
        className="font-mono mt-2"
        style={{ color: '#37ff14', opacity: 0.45, fontSize: '10px', letterSpacing: '0.2em' }}
      >
        v1.0 &mdash; Portfolio Environment
      </p>
    </div>
  );
}

/* ────────── Boot sequence lines ────────── */

const BOOT_LINES = [
  { text: 'BIOS v3.7.14 - Isaac Mora Systems', delay: 0 },
  { text: 'Copyright (C) 2024 IsaacMora Industries', delay: 150 },
  { text: '', delay: 200 },
  { text: 'Checking RAM.......... 1024 MB OK', delay: 400 },
  { text: 'Detecting primary drive... SSD0 found', delay: 300 },
  { text: '', delay: 100 },
  { text: 'Loading kernel modules...', delay: 350 },
  { text: '  [OK] module: display-driver', delay: 200 },
  { text: '  [OK] module: network-stack', delay: 180 },
  { text: '  [OK] module: hologram-renderer', delay: 220 },
  { text: '  [OK] module: window-manager', delay: 200 },
  { text: '  [OK] module: portfolio-core', delay: 250 },
  { text: '', delay: 100 },
  { text: 'Mounting filesystem... done', delay: 300 },
  { text: 'Starting services...', delay: 250 },
  { text: '  [OK] desktop-grid.service', delay: 200 },
  { text: '  [OK] content-loader.service', delay: 180 },
  { text: '  [OK] icon-manager.service', delay: 200 },
  { text: '', delay: 100 },
  { text: 'All systems operational.', delay: 300 },
  { text: '', delay: 100 },
  { text: 'Welcome to IM\'os v1.0', delay: 400 },
  { text: 'Starting desktop environment...', delay: 500 },
];

/* ────────── Phase durations ────────── */
const LOGO_DISPLAY_MS = 2200;   // logo alone on screen
const LOGO_FADE_MS = 600;       // logo fades out

export default function BootScreen({ onBootComplete, minDuration = 3000 }: BootScreenProps) {
  const [phase, setPhase] = useState<'logo' | 'logoFade' | 'boot'>('logo');
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [bootProgress, setBootProgress] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  // Blinking cursor
  useEffect(() => {
    const interval = setInterval(() => setCursorVisible((p) => !p), 530);
    return () => clearInterval(interval);
  }, []);

  // Phase: logo -> logoFade -> boot
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('logoFade'), LOGO_DISPLAY_MS);
    const t2 = setTimeout(() => setPhase('boot'), LOGO_DISPLAY_MS + LOGO_FADE_MS);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const startFadeOut = useCallback(() => {
    setFadeOut(true);
    setTimeout(() => onBootComplete(), 600);
  }, [onBootComplete]);

  // Boot text sequence (starts when phase === 'boot')
  useEffect(() => {
    if (phase !== 'boot') return;

    const bootStart = Date.now();
    let totalDelay = 0;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    BOOT_LINES.forEach((line, i) => {
      totalDelay += line.delay;
      const timeout = setTimeout(() => {
        setVisibleLines((prev) => [...prev, line.text]);
        setBootProgress(Math.round(((i + 1) / BOOT_LINES.length) * 100));

        if (i === BOOT_LINES.length - 1) {
          const elapsed = Date.now() - bootStart + LOGO_DISPLAY_MS + LOGO_FADE_MS;
          const remaining = Math.max(0, minDuration - elapsed);
          const finishTimeout = setTimeout(() => startFadeOut(), remaining + 300);
          timeouts.push(finishTimeout);
        }
      }, totalDelay);
      timeouts.push(timeout);
    });

    return () => timeouts.forEach(clearTimeout);
  }, [phase, minDuration, startFadeOut]);

  return (
    <section
      className={`fixed inset-0 z-[9999] bg-black flex flex-col transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      aria-label="System boot screen"
    >
      {/* Scan lines overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(55,255,20,0.03) 2px, rgba(55,255,20,0.03) 4px)',
          zIndex: 1,
        }}
      />

      {/* CRT vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)',
          zIndex: 2,
        }}
      />

      {/* ── LOGO PHASE ── */}
      {(phase === 'logo' || phase === 'logoFade') && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ zIndex: 3 }}
        >
          <IMosLogo visible={phase === 'logo'} />
        </div>
      )}

      {/* ── BOOT PHASE ── */}
      {phase === 'boot' && (
        <>
          {/* Boot text area */}
          <div className="flex-1 overflow-hidden p-6 font-mono text-sm relative" style={{ zIndex: 3 }}>
            <div className="max-w-2xl">
              {visibleLines.map((line, i) => (
                <div key={i} className="leading-6" style={{ minHeight: '1.5rem' }}>
                  {line.includes('[OK]') ? (
                    <span>
                      <span className="text-oldgreen">
                        {'  ['}
                        <span className="font-bold">OK</span>
                        {'] '}
                      </span>
                      <span style={{ color: '#a0a0a0' }}>
                        {line.replace('  [OK] ', '')}
                      </span>
                    </span>
                  ) : line.startsWith('Welcome') ? (
                    <span className="text-oldgreen font-bold">{line}</span>
                  ) : (
                    <span style={{ color: '#c0c0c0' }}>{line}</span>
                  )}
                </div>
              ))}
              {/* Blinking cursor */}
              {!fadeOut && (
                <span
                  className="inline-block w-2 h-4 bg-oldgreen align-middle"
                  style={{
                    opacity: cursorVisible ? 1 : 0,
                    marginLeft: '2px',
                    verticalAlign: 'text-bottom',
                  }}
                />
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-6 pb-6 relative" style={{ zIndex: 3 }}>
            <div className="max-w-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs" style={{ color: '#808080' }}>
                  BOOT PROGRESS
                </span>
                <span className="font-mono text-xs text-oldgreen">{bootProgress}%</span>
              </div>
              <div className="h-1.5 bg-neutral-900 border border-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-oldgreen transition-all duration-300 ease-out"
                  style={{
                    width: `${bootProgress}%`,
                    boxShadow: '0 0 8px rgba(55,255,20,0.5)',
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
