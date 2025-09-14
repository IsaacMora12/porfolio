export type WindowId = string;

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface WindowState {
  id: WindowId;
  title: string;
  position: WindowPosition;
  size: WindowSize;
  zIndex: number;
  isActive: boolean;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  content?: React.ReactNode;
  icon?: string;
}

export interface CreateWindowOptions {
  id?: WindowId;
  title?: string;
  position?: Partial<WindowPosition>;
  size?: Partial<WindowSize>;
  content?: React.ReactNode;
  icon?: string;
}

