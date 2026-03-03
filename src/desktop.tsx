import { useMemo, useState, useEffect } from 'react';
import WindowComponent from './componets/window';
import { useWindowManager } from './domain/window/useWindowManager';
import DesktopGrid from './componets/DesktopGrid';
import { useContent } from './domain/contentWindow/useContent';
import BootScreen from './componets/BootScreen';
import { fileSystemService } from './domain/filesystem/FileSystemService';
import { indexedDBService } from './service/IndexedDBService';
import { windowEvents } from './domain/window/WindowEvents';
import type { IconPosition, IconState } from './domain/icon/types';
import type { FileSystemState } from './domain/filesystem/types';

// Helper function to get icon name based on file extension
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getFileIconName(_extension?: string): string {
  // For now, use default file icon for all files
  // DesktopIcon only supports: terminal, explorer, folder, and default
  return 'file';
}

function Desktop() {
  const { windows, create, bringToFront, move, resize, close, minimize, toggleMaximize } = useWindowManager();
  const { contents } = useContent();
  const [desktopIcons, setDesktopIcons] = useState<IconState[]>([]);
  const [isBooting, setIsBooting] = useState(true);
  const [filesystemFolders, setFilesystemFolders] = useState<IconState[]>([]);

  // Load filesystem from IndexedDB on mount
  useEffect(() => {
    const loadFilesystem = async () => {
      try {
        console.log('[Desktop] Initializing IndexedDB...');
        await indexedDBService.init();
        console.log('[Desktop] Loading filesystem from DB...');
        const savedState = await indexedDBService.load<FileSystemState>('filesystem');
        console.log('[Desktop] Saved state found:', savedState ? 'yes' : 'no');
        if (savedState) {
          console.log('[Desktop] Root ID in saved state:', savedState.rootId);
          console.log('[Desktop] Current folder ID in saved state:', savedState.currentFolderId);
          console.log('[Desktop] Items count in saved state:', Object.keys(savedState.items).length);
          fileSystemService.loadState(savedState);
          console.log('[Desktop] State loaded successfully');
        } else {
          console.log('[Desktop] No saved state, using default initialization');
        }
      } catch (error) {
        console.error('[Desktop] Failed to load filesystem:', error);
      }
    };
    loadFilesystem();
  }, []);

  // Subscribe to filesystem changes and save to IndexedDB
  useEffect(() => {
    const unsubscribe = fileSystemService.subscribe(async () => {
      const state = fileSystemService.getState();
      try {
        await indexedDBService.save('filesystem', state);
      } catch (error) {
        console.error('Failed to save filesystem:', error);
      }
      updateFilesystemFolders();
    });
    return unsubscribe;
  }, []);

  // Update filesystem folders for desktop
  const updateFilesystemFolders = () => {
    // Always get items from Desktop folder, not current folder
    const items = fileSystemService.getDesktopItems();
    
    // Get existing positions from ALL icons to avoid overlap
    const existingPositions = new Set(
      [...desktopIcons, ...filesystemFolders].map(icon => `${icon.position.col},${icon.position.row}`)
    );
    
    // Find first available position
    const findNextAvailable = (): { col: number; row: number } => {
      let col = 0;
      let row = 0;
      const maxCols = 8;
      
      while (existingPositions.has(`${col},${row}`)) {
        col++;
        if (col >= maxCols) {
          col = 0;
          row++;
        }
      }
      
      existingPositions.add(`${col},${row}`);
      return { col, row };
    };
    
    const folderIcons: IconState[] = items.map((item) => {
      const position = findNextAvailable();
      return {
        id: `fs-${item.type}-${item.id}`,
        title: item.name,
        position,
        iconLogo: item.type === 'folder' ? 'folder' : getFileIconName(item.extension),
        content: null,
        action: () => {
          if (item.type === 'folder') {
            // Navigate to folder in File Explorer
            fileSystemService.navigateToFolder(item.id);
            const explorerContent = contents?.find(c => c.metadata.title === 'File Explorer');
            if (explorerContent) {
              create({
                content: <explorerContent.Component />,
                title: 'File Explorer'
              });
            }
          } else {
            // Open file with nano - emit event after Terminal is created
            const terminalContent = contents?.find(c => c.metadata.title === 'Terminal');
            if (terminalContent) {
              create({
                content: <terminalContent.Component />,
                title: 'Terminal'
              });
              // Emit event after a small delay to ensure Terminal is mounted
              setTimeout(() => {
                windowEvents.emit('open-nano', { name: item.name, id: item.id });
              }, 100);
            }
          }
        },
      };
    });
    setFilesystemFolders(folderIcons);
  };

  useEffect(() => {
    if (contents && Array.isArray(contents)) {
      const ICONS_PER_ROW = 8;
      const initialIcons = contents.map((item, index) => {
        if (!item || !item.metadata) {
          
          return null;
        }
        
        // Skip Terminal and File Explorer as they are handled as system icons
        if (item.metadata.title === 'Terminal' || item.metadata.title === 'File Explorer') {
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

  // Add terminal and explorer icons to desktop
  useEffect(() => {
    const systemIcons: IconState[] = [
      {
        id: 'terminal-icon',
        title: 'Terminal',
        position: { col: 0, row: 0 },
        iconLogo: 'terminal',
        content: null,
        action: () => {
          const terminalContent = contents?.find(c => c.metadata.title === 'Terminal');
          if (terminalContent) {
            create({
              content: <terminalContent.Component />,
              title: 'Terminal'
            });
          }
        },
      },
      {
        id: 'explorer-icon',
        title: 'File Explorer',
        position: { col: 1, row: 0 },
        iconLogo: 'explorer',
        content: null,
        action: () => {
          const explorerContent = contents?.find(c => c.metadata.title === 'File Explorer');
          if (explorerContent) {
            create({
              content: <explorerContent.Component />,
              title: 'File Explorer'
            });
          }
        },
      },
    ];
    setDesktopIcons(prev => {
      // Filter out system icons that might already exist
      const filtered = prev.filter(icon => icon.id !== 'terminal-icon' && icon.id !== 'explorer-icon');
      return [...systemIcons, ...filtered];
    });
  }, [contents]);

  // Find next available position
  const findAvailablePosition = (startCol: number, startRow: number): IconPosition => {
    const occupiedPositions = new Set(
      allIcons.map(icon => `${icon.position.col},${icon.position.row}`)
    );
    
    let col = startCol;
    let row = startRow;
    const maxCols = 8;
    
    while (occupiedPositions.has(`${col},${row}`)) {
      col++;
      if (col >= maxCols) {
        col = 0;
        row++;
      }
    }
    
    return { col, row };
  };

  const handleIconDrop = (id: string, position: IconPosition) => {
    // Extract item type and original ID from the icon ID
    const parts = id.split('-');
    const itemId = parts.slice(2).join('-');
    
    // Check if dropped on a folder
    const targetIcon = allIcons.find(icon => {
      const iconParts = icon.id.split('-');
      const iconType = iconParts[1];
      const iconPos = icon.position;
      return iconType === 'folder' && iconPos.col === position.col && iconPos.row === position.row && icon.id !== id;
    });
    
    if (targetIcon) {
      // Extract folder ID from target icon
      const targetParts = targetIcon.id.split('-');
      const targetFolderId = targetParts.slice(2).join('-');
      
      // Move item to folder
      fileSystemService.moveToFolder(itemId, targetFolderId);
    } else {
      // Check if position is available, find new position if not
      const occupiedPositions = new Set(
        allIcons.filter(icon => icon.id !== id).map(icon => `${icon.position.col},${icon.position.row}`)
      );
      
      let finalPosition = position;
      if (occupiedPositions.has(`${position.col},${position.row}`)) {
        finalPosition = findAvailablePosition(position.col, position.row);
      }
      
      // Update position in both state variables
      setDesktopIcons(prevIcons =>
        prevIcons.map(icon =>
          icon.id === id ? { ...icon, position: finalPosition } : icon
        )
      );
      setFilesystemFolders(prevIcons =>
        prevIcons.map(icon =>
          icon.id === id ? { ...icon, position: finalPosition } : icon
        )
      );
      
      // Save position to IndexedDB
      saveIconPosition(id, finalPosition);
    }
  };

  // Save icon position to IndexedDB
  const saveIconPosition = async (iconId: string, position: IconPosition) => {
    try {
      const savedPositions = await indexedDBService.load<Record<string, IconPosition>>('iconPositions') || {};
      savedPositions[iconId] = position;
      await indexedDBService.save('iconPositions', savedPositions);
    } catch (error) {
      console.error('Failed to save icon position:', error);
    }
  };

  // Load saved icon positions
  useEffect(() => {
    const loadPositions = async () => {
      try {
        const savedPositions = await indexedDBService.load<Record<string, IconPosition>>('iconPositions');
        if (savedPositions) {
          setDesktopIcons(prev => prev.map(icon => {
            if (savedPositions[icon.id]) {
              return { ...icon, position: savedPositions[icon.id] };
            }
            return icon;
          }));
          setFilesystemFolders(prev => prev.map(icon => {
            if (savedPositions[icon.id]) {
              return { ...icon, position: savedPositions[icon.id] };
            }
            return icon;
          }));
        }
      } catch (error) {
        console.error('Failed to load icon positions:', error);
      }
    };
    loadPositions();
  }, []);

  const openWindows = useMemo(() => windows.filter((w) => w.isOpen), [windows]);

  const allIcons = useMemo(() => {
    // Merge filesystem folders with desktop icons
    const fsFolderIds = new Set(filesystemFolders.map(f => f.id));
    const filteredDesktopIcons = desktopIcons.filter(icon => !fsFolderIds.has(icon.id));
    return [...filteredDesktopIcons, ...filesystemFolders];
  }, [desktopIcons, filesystemFolders]);

  // Show boot screen until data is ready or minimum 3 seconds have passed
  if (isBooting) {
    return <BootScreen onBootComplete={() => setIsBooting(false)} minDuration={3000} />;
  }

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
          icons={allIcons}
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
     {// Taskbar
     }
      <div className="fixed bottom-0 left-0 right-0 h-12 bg-black backdrop-blur border-t border-oldgreen border-dashed flex items-center gap-2 px-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {openWindows.map((w) => (
            <button
              key={w.id}
              onClick={() => bringToFront(w.id)}
              className={`px-2 py-1 bg-black text-oldgreen rounded hover:bg-oldgreen/25 hover:text-black whitespace-nowrap ${w.isActive ? 'bg-oldgreen/15' : ''}`}
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
