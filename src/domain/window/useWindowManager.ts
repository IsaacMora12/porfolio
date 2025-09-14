import { useRef, useState, useCallback } from 'react';
import { WindowManager } from './WindowManager';
import type { CreateWindowOptions, WindowId, WindowPosition, WindowSize, WindowState } from './types';

export function useWindowManager() {
  const managerRef = useRef<WindowManager | null>(null);
  if (managerRef.current === null) managerRef.current = new WindowManager();
  const manager = managerRef.current;

  const [windows, setWindows] = useState<WindowState[]>(() => manager.state);

  const sync = useCallback(() => setWindows(manager.state), [manager]);

  const create = useCallback((options?: CreateWindowOptions) => {
    manager.createWindow(options);
    sync();
  }, [manager, sync]);

  const bringToFront = useCallback((id: WindowId) => {
    manager.bringToFront(id);
    sync();
  }, [manager, sync]);

  const move = useCallback((id: WindowId, x: number, y: number) => {
    manager.move(id, { x, y } as WindowPosition);
    sync();
  }, [manager, sync]);

  const resize = useCallback((id: WindowId, width: number, height: number, x: number, y: number) => {
    manager.resize(id, { width, height } as WindowSize, { x, y } as WindowPosition);
    sync();
  }, [manager, sync]);

  const close = useCallback((id: WindowId) => {
    manager.close(id);
    sync();
  }, [manager, sync]);

  const minimize = useCallback((id: WindowId) => {
    manager.minimize(id);
    sync();
  }, [manager, sync]);

  const toggleMaximize = useCallback((id: WindowId) => {
    manager.toggleMaximize(id);
    sync();
  }, [manager, sync]);


  return {
    windows,
    icons: windows.map(w => w.icon),
    create,
    bringToFront,
    move,
    resize,
    close,
    minimize,
    toggleMaximize,
    
  };
}