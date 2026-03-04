import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import WindowComponent from './componets/window';
import { useWindowManager } from './domain/window/useWindowManager';
import DesktopGrid from './componets/DesktopGrid';
import { useContent } from './domain/contentWindow/useContent';
import BootScreen from './componets/BootScreen';
import { fileSystemService } from './domain/filesystem/FileSystemService';
import { indexedDBService } from './service/IndexedDBService';
import { windowEvents } from './domain/window/WindowEvents';
import TextEditor from './content/TextEditor';
import type { IconPosition, IconState } from './domain/icon/types';
import type { FileSystemState } from './domain/filesystem/types';

function Desktop() {
  const { windows, create, bringToFront, move, resize, close, minimize, toggleMaximize } = useWindowManager();
  const { contents } = useContent();
  const [desktopIcons, setDesktopIcons] = useState<IconState[]>([]);
  const [isBooting, setIsBooting] = useState(true);
  const [filesystemFolders, setFilesystemFolders] = useState<IconState[]>([]);
  const [fsReady, setFsReady] = useState(false);

  // Store saved icon positions in a ref so it persists across renders
  const savedPositionsRef = useRef<Record<string, IconPosition>>({});

  // Load filesystem from IndexedDB on mount
  useEffect(() => {
    const loadFilesystem = async () => {
      try {
        await indexedDBService.init();
        const savedState = await indexedDBService.load<FileSystemState>('filesystem');
        if (savedState) {
          fileSystemService.loadState(savedState);
        }
        // Load saved icon positions
        const savedPositions = await indexedDBService.load<Record<string, IconPosition>>('iconPositions');
        if (savedPositions) {
          savedPositionsRef.current = savedPositions;
        }
        setFsReady(true);
      } catch (error) {
        console.error('[Desktop] Failed to load filesystem:', error);
        setFsReady(true);
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
    });
    return unsubscribe;
  }, []);

  // Helper: get all currently occupied positions from a list of icons
  const getOccupiedPositions = useCallback((icons: IconState[], excludeId?: string): Set<string> => {
    return new Set(
      icons
        .filter(icon => icon.id !== excludeId)
        .map(icon => `${icon.position.col},${icon.position.row}`)
    );
  }, []);

  // Helper: find next available grid position
  const findNextAvailablePosition = useCallback((occupied: Set<string>, startCol = 0, startRow = 0): IconPosition => {
    const maxCols = 8;
    let col = startCol;
    let row = startRow;
    while (occupied.has(`${col},${row}`)) {
      col++;
      if (col >= maxCols) {
        col = 0;
        row++;
      }
    }
    return { col, row };
  }, []);

  // Build filesystem icons from Desktop folder items
  // This is stable: it uses saved positions from IndexedDB when available
  const buildFilesystemIcons = useCallback((existingSystemIcons: IconState[]): IconState[] => {
    const items = fileSystemService.getDesktopItems();
    const occupied = getOccupiedPositions(existingSystemIcons);

    const folderIcons: IconState[] = items.map((item) => {
      const iconId = `fs-${item.type}-${item.id}`;

      // Use saved position if available, otherwise find a new one
      let position: IconPosition;
      if (savedPositionsRef.current[iconId]) {
        position = savedPositionsRef.current[iconId];
      } else {
        position = findNextAvailablePosition(occupied);
        // Save the assigned position
        savedPositionsRef.current[iconId] = position;
      }
      occupied.add(`${position.col},${position.row}`);

      return {
        id: iconId,
        title: item.name,
        position,
        iconLogo: item.type === 'folder' ? 'folder' : 'file',
        content: null,
        action: () => {
          if (item.type === 'folder') {
            fileSystemService.navigateToFolder(item.id);
            const explorerContent = contents?.find(c => c.metadata.title === 'File Explorer');
            if (explorerContent) {
              create({
                content: <explorerContent.Component />,
                title: 'File Explorer'
              });
            }
          } else {
            // Open file directly in Nano editor
            create({
              content: <TextEditor fileName={item.name} fileId={item.id} />,
              title: `TextEditor - ${item.name}`
            });
          }
        },
      };
    });

    return folderIcons;
  }, [contents, create, getOccupiedPositions, findNextAvailablePosition]);

  // Initialize all icons once filesystem and contents are ready
  useEffect(() => {
    if (!fsReady || !contents || !Array.isArray(contents)) return;

    // 1. Build system icons (Terminal, File Explorer) with fixed positions
    const systemIcons: IconState[] = [
      {
        id: 'terminal-icon',
        title: 'Terminal',
        position: savedPositionsRef.current['terminal-icon'] || { col: 0, row: 0 },
        iconLogo: 'terminal',
        content: null,
        action: () => {
          const terminalContent = contents.find(c => c.metadata.title === 'Terminal');
          if (terminalContent) {
            create({ content: <terminalContent.Component />, title: 'Terminal' });
          }
        },
      },
      {
        id: 'explorer-icon',
        title: 'File Explorer',
        position: savedPositionsRef.current['explorer-icon'] || { col: 1, row: 0 },
        iconLogo: 'explorer',
        content: null,
        action: () => {
          const explorerContent = contents.find(c => c.metadata.title === 'File Explorer');
          if (explorerContent) {
            create({ content: <explorerContent.Component />, title: 'File Explorer' });
          }
        },
      },
    ];

    // 2. Build content icons (Curriculum etc.), skipping Terminal, File Explorer, Nano
    const skipTitles = new Set(['Terminal', 'File Explorer', 'Nano']);
    const occupied = getOccupiedPositions(systemIcons);
    const contentIcons: IconState[] = [];
    
    contents.forEach((item, index) => {
      if (!item?.metadata || skipTitles.has(item.metadata.title)) return;
      const iconId = `icon-${index}`;
      let position: IconPosition;
      if (savedPositionsRef.current[iconId]) {
        position = savedPositionsRef.current[iconId];
      } else {
        position = findNextAvailablePosition(occupied);
        savedPositionsRef.current[iconId] = position;
      }
      occupied.add(`${position.col},${position.row}`);

      contentIcons.push({
        id: iconId,
        title: item.metadata.title || 'Untitled',
        position,
        iconLogo: typeof item.metadata.icon === 'string' ? item.metadata.icon : undefined,
        content: null,
        action: () => {
          create({
            content: <item.Component />,
            title: item.metadata.title || 'Untitled'
          });
        },
      });
    });

    setDesktopIcons([...systemIcons, ...contentIcons]);

    // 3. Build filesystem icons
    const allSystemAndContent = [...systemIcons, ...contentIcons];
    const fsIcons = buildFilesystemIcons(allSystemAndContent);
    setFilesystemFolders(fsIcons);

    // Persist any new positions
    indexedDBService.save('iconPositions', savedPositionsRef.current).catch(() => {});
  }, [fsReady, contents, create, getOccupiedPositions, findNextAvailablePosition, buildFilesystemIcons]);

  // Subscribe to filesystem changes to update filesystem folder icons
  // This only adds/removes icons, it does NOT recalculate existing positions
  useEffect(() => {
    if (!fsReady) return;

    const unsubscribe = fileSystemService.subscribe(() => {
      setFilesystemFolders(prev => {
        const items = fileSystemService.getDesktopItems();
        const newItemIds = new Set(items.map(i => `fs-${i.type}-${i.id}`));
        const prevIds = new Set(prev.map(i => i.id));

        // Keep existing icons that still exist (preserve positions)
        const kept = prev.filter(icon => newItemIds.has(icon.id));

        // Add new items only
        const newItems = items.filter(i => !prevIds.has(`fs-${i.type}-${i.id}`));
        if (newItems.length === 0 && kept.length === prev.length) {
          // Nothing changed in desktop items
          return kept.length !== prev.length ? kept : prev;
        }

        // Calculate occupied positions for placing new items
        const allCurrentIcons = [...desktopIcons, ...kept];
        const occupied = getOccupiedPositions(allCurrentIcons);

        const addedIcons: IconState[] = newItems.map((item) => {
          const iconId = `fs-${item.type}-${item.id}`;
          let position: IconPosition;
          if (savedPositionsRef.current[iconId]) {
            position = savedPositionsRef.current[iconId];
          } else {
            position = findNextAvailablePosition(occupied);
            savedPositionsRef.current[iconId] = position;
          }
          occupied.add(`${position.col},${position.row}`);

          return {
            id: iconId,
            title: item.name,
            position,
            iconLogo: item.type === 'folder' ? 'folder' : 'file',
            content: null,
            action: () => {
              if (item.type === 'folder') {
                fileSystemService.navigateToFolder(item.id);
                const explorerContent = contents?.find(c => c.metadata.title === 'File Explorer');
                if (explorerContent) {
                  create({
                    content: <explorerContent.Component />,
                    title: 'File Explorer'
                  });
                }
              } else {
                // Open file directly in Nano editor
                create({
                  content: <TextEditor fileName={item.name} fileId={item.id} />,
                  title: `TextEditor - ${item.name}`
                });
              }
            },
          };
        });

        // Persist new positions
        if (addedIcons.length > 0) {
          indexedDBService.save('iconPositions', savedPositionsRef.current).catch(() => {});
        }

        return [...kept, ...addedIcons];
      });
    });
    return unsubscribe;
  }, [fsReady, desktopIcons, contents, create, getOccupiedPositions, findNextAvailablePosition]);

  // Listen for 'open-curriculum' event from terminal to open the Curriculum window
  useEffect(() => {
    const handleOpenCurriculum = () => {
      const curriculumContent = contents?.find(c => c.metadata.title === 'Curriculum');
      if (curriculumContent) {
        create({
          content: <curriculumContent.Component />,
          title: 'Curriculum'
        });
      }
    };
    windowEvents.on('open-curriculum', handleOpenCurriculum);
    return () => windowEvents.off('open-curriculum', handleOpenCurriculum);
  }, [contents, create]);

  // Listen for 'open-file-from-explorer' to open files clicked in FileExplorer
  useEffect(() => {
    const handleOpenFile = (data: unknown) => {
      const { id, name } = data as { id: string; name: string };

      // Special case: curriculum.txt opens the rich Curriculum component
      if (name === 'curriculum.txt') {
        const curriculumContent = contents?.find(c => c.metadata.title === 'Curriculum');
        if (curriculumContent) {
          create({
            content: <curriculumContent.Component />,
            title: 'Curriculum'
          });
        }
        return;
      }

      // Check if the file is read-only
      const item = fileSystemService.getItemById(id);
      const isReadOnly = item && item.type !== 'folder' && (item as any).readOnly;

      if (isReadOnly) {
        // Open a read-only viewer (display content in a simple window)
        const fileContent = item && 'content' in item ? (item as any).content : '';
        create({
          content: (
            <div className="h-full flex flex-col bg-black text-oldgreen font-mono text-sm">
              <div className="bg-black px-2 py-1 text-xs border-b border-dashed border-oldgreen flex justify-between">
                <span>{name} (read-only)</span>
              </div>
              <div className="flex-1 overflow-auto p-3 whitespace-pre-wrap">{fileContent}</div>
            </div>
          ),
          title: name
        });
      } else {
        // Open in TextEditor
        windowEvents.emit('open-texteditor', { name, id });
      }
    };

    windowEvents.on('open-file-from-explorer', handleOpenFile);
    return () => windowEvents.off('open-file-from-explorer', handleOpenFile);
  }, [contents, create]);

  // Listen for 'open-texteditor' event to open TextEditor directly
  useEffect(() => {
    const handleOpenNano = (fileInfo: unknown) => {
      // Support both string (filename) and object {name, id}
      let name: string;
      let fileId: string | undefined;

      if (typeof fileInfo === 'object' && fileInfo !== null) {
        const info = fileInfo as { name: string; id?: string };
        name = info.name;
        fileId = info.id;
      } else {
        name = typeof fileInfo === 'string' ? fileInfo : 'untitled.txt';
      }

      // If we have a file ID, get the actual filename
      if (fileId) {
        const file = fileSystemService.getFileById(fileId);
        if (file) {
          name = file.name;
        }
      }

      // Open Nano editor window with fileId for proper file lookup
      create({
        content: <TextEditor fileName={name} fileId={fileId} />,
        title: `TextEditor - ${name}`
      });
    };

    windowEvents.on('open-texteditor', handleOpenNano);
    return () => windowEvents.off('open-texteditor', handleOpenNano);
  }, [create]);

  // Listen for 'close-texteditor' event to close TextEditor windows (when Ctrl+X is pressed)
  useEffect(() => {
    const handleCloseNano = () => {
      // Find the most recently opened Nano window (highest zIndex)
      const textEditorWindows = windows.filter(w => w.title?.startsWith('TextEditor -'));
      if (textEditorWindows.length > 0) {
        // Sort by zIndex descending and close the top one
        const topTextEditorWindow = textEditorWindows.sort((a, b) => b.zIndex - a.zIndex)[0];
        close(topTextEditorWindow.id);
      }
    };

    windowEvents.on('close-texteditor', handleCloseNano);
    return () => windowEvents.off('close-texteditor', handleCloseNano);
  }, [windows, close]);

  // All icons combined
  const allIcons = useMemo(() => {
    const fsFolderIds = new Set(filesystemFolders.map(f => f.id));
    const filteredDesktopIcons = desktopIcons.filter(icon => !fsFolderIds.has(icon.id));
    return [...filteredDesktopIcons, ...filesystemFolders];
  }, [desktopIcons, filesystemFolders]);

  const handleIconDrop = useCallback((id: string, position: IconPosition) => {
    // Check if dropped on a folder (for drag-into-folder)
    const targetIcon = allIcons.find(icon => {
      const iconParts = icon.id.split('-');
      const iconType = iconParts[1];
      return iconType === 'folder' && icon.position.col === position.col && icon.position.row === position.row && icon.id !== id;
    });

    if (targetIcon) {
      const parts = id.split('-');
      const itemId = parts.slice(2).join('-');
      const targetParts = targetIcon.id.split('-');
      const targetFolderId = targetParts.slice(2).join('-');
      fileSystemService.moveToFolder(itemId, targetFolderId);
      return;
    }

    // Check if the target position is already occupied by another icon
    const isOccupied = allIcons.some(
      icon => icon.id !== id && icon.position.col === position.col && icon.position.row === position.row
    );

    if (isOccupied) {
      // Don't move - position is taken
      return;
    }

    // Clamp to valid grid bounds
    const finalPosition: IconPosition = {
      col: Math.max(0, position.col),
      row: Math.max(0, position.row),
    };

    // Update position in state
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

    // Save position
    savedPositionsRef.current[id] = finalPosition;
    indexedDBService.save('iconPositions', savedPositionsRef.current).catch(() => {});
  }, [allIcons]);

  const openWindows = useMemo(() => windows.filter((w) => w.isOpen), [windows]);

  // Show boot screen
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

      {/* Taskbar */}
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
