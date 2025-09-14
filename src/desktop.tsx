import { useMemo, useState, useEffect } from 'react';
import WindowComponent from './componets/window';
import { useWindowManager } from './domain/window/useWindowManager';
import DesktopGrid from './componets/DesktopGrid';
import { useContent } from './domain/contentWindow/useContent';
import { IconPosition } from './domain/icon/types';
import { IconState } from './domain/icon/types';

function Desktop() {
  const { windows, create, bringToFront, move, resize, close, minimize, toggleMaximize } = useWindowManager();
  const { contents } = useContent();
  const [desktopIcons, setDesktopIcons] = useState<IconState[]>([]);

  useEffect(() => {
    if (contents && Array.isArray(contents)) {
      const ICONS_PER_ROW = 8;
      const initialIcons = contents.map((item, index) => {
        if (!item || !item.metadata) {
          
          return null;
        }
        const col = index % ICONS_PER_ROW;
        const row = Math.floor(index / ICONS_PER_ROW);
        return {
          id: `icon-${index}`,
          title: item.metadata.title || 'Untitled',
          position: { col, row },
          iconLogo: item.metadata.icon || '',
          action: () => {
            
            create({
              content: <item.Component />,
              title: item.metadata.title || 'Untitled'
            });
          },
        };
      }).filter(Boolean) as IconState[];
      setDesktopIcons(initialIcons);
    }
  }, [contents, create]);

  const handleIconDrop = (id: string, position: IconPosition) => {
    setDesktopIcons(prevIcons =>
      prevIcons.map(icon =>
        icon.id === id ? { ...icon, position } : icon
      )
    );
  };

  const minimized = useMemo(() => windows.filter((w) => w.isMinimized), [windows]);

  if (!desktopIcons || desktopIcons.length === 0) {
    return (
      <section className="w-screen h-screen overflow-hidden bg-[--color-abbadinBlack] text-neutral-100">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl mb-4">No applications found</h2>
            <p>Add some .tsx files to the content folder</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-screen h-screen overflow-hidden bg-[--color-abbadinBlack] text-neutral-100">
      <div className="relative w-full h-[calc(100vh-48px)]">
        <DesktopGrid
          icons={desktopIcons}
          onIconDrop={handleIconDrop}
        />

        {windows.map((w) => (
          <WindowComponent
            key={w.id}
            id={w.id}
            title={w.title}
            position={w.position}
            size={w.size}
            zIndex={w.zIndex}
            isActive={w.isActive}
            isMinimized={w.isMinimized}
            isMaximized={w.isMaximized}
            onFocus={bringToFront}
            onMove={move}
            onResize={resize}
            onClose={close}
            onMinimize={minimize}
            onToggleMaximize={toggleMaximize}
          >
            {w.content}
          </WindowComponent>
        ))}
      </div>
     
      <div className="fixed bottom-0 left-0 right-0 h-12 bg-black backdrop-blur border-t border-oldgreen border-dashed flex items-center gap-2 px-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {minimized.map((w) => (
            <button
              key={w.id}
              onClick={() => bringToFront(w.id)}
              className="px-2 py-1 bg-black text-oldgreen rounded hover:bg-oldgreen/25 hover:text-black whitespace-nowrap"
              title={w.title}
            >
              {w.title}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Desktop;