import type { ReactNode } from 'react';

export type IconId = string;

export interface IconPosition {
  col: number;
  row: number;
}

export interface IconState {
  id: IconId;
  title: string;
  position: IconPosition;
  content: ReactNode;
  action: () => void;
  iconLogo?: string;
}

export interface CreateIconOptions {
  title: string;
  position: IconPosition;
  content: ReactNode;
  action: () => void;
  iconLogo?: string;
}
