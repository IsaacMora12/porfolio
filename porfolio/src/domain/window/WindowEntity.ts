import type { ReactNode } from 'react';
import type { WindowId, WindowPosition, WindowSize, WindowState, CreateWindowOptions } from './types';

const DEFAULT_SIZE: WindowSize = { width: 480, height: 320 };
const DEFAULT_POSITION: WindowPosition = { x: 40, y: 40 };

export class WindowEntity implements WindowState {
  id: WindowId;
  title: string;
  position: WindowPosition;
  size: WindowSize;
  zIndex: number;
  isActive: boolean;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  content?: ReactNode;

  constructor(init?: CreateWindowOptions & Partial<Pick<WindowState, 'zIndex'>>) {
    this.id = init?.id ?? crypto.randomUUID();
    this.title = init?.title ?? 'Window';
    this.position = {
      x: init?.position?.x ?? DEFAULT_POSITION.x,
      y: init?.position?.y ?? DEFAULT_POSITION.y,
    };
    this.size = {
      width: init?.size?.width ?? DEFAULT_SIZE.width,
      height: init?.size?.height ?? DEFAULT_SIZE.height,
    };
    this.zIndex = init?.zIndex ?? 1;
    this.isActive = true;
    this.isOpen = true;
    this.isMinimized = false;
    this.isMaximized = false;
    this.content = init?.content;
  }

  move(next: WindowPosition) {
    this.position = next;
  }

  resize(nextSize: WindowSize, nextPosition: WindowPosition) {
    this.size = nextSize;
    this.position = nextPosition;
  }

  focus(newZ: number) {
    this.isActive = true;
    this.isMinimized = false;
    this.zIndex = newZ;
  }

  blur() {
    this.isActive = false;
  }

  minimize() {
    this.isMinimized = true;
    this.isActive = false;
  }

  toggleMaximize() {
    this.isMaximized = !this.isMaximized;
    if (this.isMaximized) this.isMinimized = false;
  }
}


