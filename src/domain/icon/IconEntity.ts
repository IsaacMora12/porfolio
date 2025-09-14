import type { CreateIconOptions, IconId, IconPosition, IconState } from './types';
import { type ReactNode } from 'react';

export class IconEntity implements IconState {
  id: IconId;
  title: string;
  position: IconPosition;
  content: ReactNode;
  action: () => void;

  constructor(options: CreateIconOptions) {
    this.id = crypto.randomUUID();
    this.title = options.title;
    this.position = options.position;
    this.content = options.content;
    this.action = options.action;
  }

  move(newPosition: IconPosition): IconEntity {
    const newIcon = new IconEntity({ ...this, position: newPosition });
    newIcon.id = this.id; // Preserve the original ID
    return newIcon;
  }
}
