import { useState, useEffect, useCallback } from 'react';

interface BootScreenProps {
  onBootComplete: () => void;
  minDuration?: number;
}

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
  { text: 'Welcome to IsaacMora OS v1.0', delay: 400 },
  { text: 'Starting desktop environment...', delay: 500 },
];

export default function BootScreen({ onBootComplete, minDuration = 3000 }: BootScreenProps) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [bootProgress, setBootProgress] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  // Blinking cursor
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  const startFadeOut = useCallback(() => {
    setFadeOut(true);
    setTimeout(() => {
      onBootComplete();
    }, 600);
  }, [onBootComplete]);

  // Boot sequence
  useEffect(() => {
    const bootStart = Date.now();
    let lineIndex = 0;
    let totalDelay = 0;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    BOOT_LINES.forEach((line, i) => {
      totalDelay += line.delay;
      const timeout = setTimeout(() => {
        setVisibleLines((prev) => [...prev, line.text]);
        setBootProgress(Math.round(((i + 1) / BOOT_LINES.length) * 100));
        lineIndex = i;

        // If last line
        if (i === BOOT_LINES.length - 1) {
          const elapsed = Date.now() - bootStart;
          const remaining = Math.max(0, minDuration - elapsed);
          const finishTimeout = setTimeout(() => {
            startFadeOut();
          }, remaining + 300);
          timeouts.push(finishTimeout);
        }
      }, totalDelay);
      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [minDuration, startFadeOut]);

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
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(55, 255, 20, 0.03) 2px, rgba(55, 255, 20, 0.03) 4px)',
          zIndex: 1,
        }}
      />

      {/* CRT vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)',
          zIndex: 2,
        }}
      />

      {/* Boot text area */}
      <div className="flex-1 overflow-hidden p-6 font-mono text-sm relative" style={{ zIndex: 3 }}>
        <div className="max-w-2xl">
          {visibleLines.map((line, i) => (
            <div key={i} className="leading-6" style={{ minHeight: '1.5rem' }}>
              {line.includes('[OK]') ? (
                <span>
                  <span className="text-oldgreen">{'  ['}
                    <span className="font-bold">OK</span>
                    {'] '}</span>
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
          {/* Blinking cursor on the last line */}
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

      {/* Progress bar at bottom */}
      <div className="px-6 pb-6 relative" style={{ zIndex: 3 }}>
        <div className="max-w-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs" style={{ color: '#808080' }}>
              BOOT PROGRESS
            </span>
            <span className="font-mono text-xs text-oldgreen">
              {bootProgress}%
            </span>
          </div>
          <div className="h-1.5 bg-neutral-900 border border-neutral-800 overflow-hidden">
            <div
              className="h-full bg-oldgreen transition-all duration-300 ease-out"
              style={{
                width: `${bootProgress}%`,
                boxShadow: '0 0 8px rgba(55, 255, 20, 0.5)',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
