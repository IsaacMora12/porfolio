import { IconEntity } from './IconEntity';
import type { CreateIconOptions, IconId, IconPosition, IconState } from './types';

export class IconManager {
  private icons: IconEntity[] = [];

  get state(): IconState[] {
    return this.icons.map((icon) => ({ ...icon }));
  }

  addIcon(options: CreateIconOptions): IconEntity {
    const icon = new IconEntity(options);
    this.icons.push(icon);
    return icon;
  }

  moveIcon(id: IconId, newPosition: IconPosition) {
    this.icons = this.icons.map((icon) => {
      if (icon.id === id) {
        return icon.move(newPosition);
      }
      return icon;
    });
  }
}
