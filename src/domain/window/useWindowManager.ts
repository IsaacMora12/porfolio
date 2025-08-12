import { useMemo, useRef, useState, useCallback } from 'react';
import { WindowManager } from './WindowManager';
import type { CreateWindowOptions, WindowId, WindowPosition, WindowSize, WindowState } from './types';

export function useWindowManager() {
  const managerRef = useRef<WindowManager | null>(null);
  if (managerRef.current === null) managerRef.current = new WindowManager();

  const [windows, setWindows] = useState<WindowState[]>(() => managerRef.current!.state);

  const sync = useCallback(() => setWindows(managerRef.current!.state), []);

  const api = useMemo(() => {
    const mgr = managerRef.current!;
    return {
      windows,
      create: (options?: CreateWindowOptions) => {
        mgr.createWindow(options);
        sync();
      },
      bringToFront: (id: WindowId) => {
        mgr.bringToFront(id);
        sync();
      },
      move: (id: WindowId, x: number, y: number) => {
        mgr.move(id, { x, y } as WindowPosition);
        sync();
      },
      resize: (id: WindowId, width: number, height: number, x: number, y: number) => {
        mgr.resize(id, { width, height } as WindowSize, { x, y } as WindowPosition);
        sync();
      },
      close: (id: WindowId) => {
        mgr.close(id);
        sync();
      },
      minimize: (id: WindowId) => {
        mgr.minimize(id);
        sync();
      },
      toggleMaximize: (id: WindowId) => {
        mgr.toggleMaximize(id);
        sync();
      },
    };
  }, [sync, windows]);

  return api;
}


