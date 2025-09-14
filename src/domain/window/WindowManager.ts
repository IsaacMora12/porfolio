import { WindowEntity } from './WindowEntity';
import type { CreateWindowOptions, WindowId, WindowState, WindowPosition, WindowSize } from './types';


export class WindowManager {
  private windows: WindowEntity[] = [];
  private topZ: number = 10;

  get state(): WindowState[] {
    return this.windows.map((w) => ({ ...w }));
  }

  createWindow(options?: CreateWindowOptions): WindowEntity {
    const w = new WindowEntity({ ...options, zIndex: ++this.topZ });
    this.windows.forEach((item) => item.blur());
    this.windows.push(w);
    return w;
  }

  bringToFront(id: WindowId) {
    const target = this.windows.find((w) => w.id === id);
    if (!target) return;
    this.windows.forEach((w) => w.blur());
    target.focus(++this.topZ);
  }

  move(id: WindowId, position: WindowPosition) {
    const target = this.windows.find((w) => w.id === id);
    if (!target) return;
    target.move(position);
  }

  resize(id: WindowId, size: WindowSize, position: WindowPosition) {
    const target = this.windows.find((w) => w.id === id);
    if (!target) return;
    target.resize(size, position);
  }
  close(id: WindowId) {
    this.windows = this.windows.filter((w) => w.id !== id);
  }

  minimize(id: WindowId) {
    const target = this.windows.find((w) => w.id === id);
    if (!target) return;
    target.minimize();
  }

  toggleMaximize(id: WindowId) {
    const target = this.windows.find((w) => w.id === id);
    if (!target) return;
    target.toggleMaximize();
  }

}