import { useState, useCallback } from 'react';
import { IconManager } from './IconManager';
import type { CreateIconOptions, IconId, IconPosition, IconState } from './types';

export function useIconManager(initialIcons: CreateIconOptions[] = []) {
  const [manager] = useState(() => {
    const newManager = new IconManager();
    initialIcons.forEach(icon => newManager.addIcon(icon));
    return newManager;
  });

  const [icons, setIcons] = useState<IconState[]>(manager.state);

  const moveIcon = useCallback(
    (id: IconId, newPosition: IconPosition) => {
      manager.moveIcon(id, newPosition);
      setIcons(manager.state);
    },
    [manager]
  );

  const addIcon = useCallback(
    (options: CreateIconOptions) => {
      manager.addIcon(options);
      setIcons(manager.state);
    },
    [manager]
  );

  return { icons, addIcon, moveIcon };
}
