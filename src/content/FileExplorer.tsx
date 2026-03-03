import { useState, useEffect, useCallback } from 'react';
import { fileSystemService } from '../domain/filesystem/FileSystemService';
import type { FileNode } from '../domain/filesystem/types';

interface ExplorerItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  extension?: string;
}

export default function FileExplorer() {
  // Use local path state instead of FileSystemService
  const [currentPath, setCurrentPath] = useState<string[]>(() => {
    // Initialize path from FileSystemService
    return fileSystemService.getPathArray();
  });
  const [items, setItems] = useState<ExplorerItem[]>([]);

  // Load items based on current path
  const loadItems = useCallback(() => {
    const folderItems = fileSystemService.getItemsFromPath(currentPath);
    setItems(folderItems);
  }, [currentPath]);

  // Load items when component mounts
  useEffect(() => {
    loadItems();
  }, []);

  // Subscribe to file system changes
  useEffect(() => {
    const unsubscribe = fileSystemService.subscribe(() => {
      loadItems();
    });
    return unsubscribe;
  }, [loadItems]);

  const handleDoubleClick = (item: ExplorerItem) => {
    if (item.type === 'folder') {
      // Navigate locally without affecting FileSystemService
      setCurrentPath([...currentPath, item.name]);
    }
  };

  const handleNavigateUp = () => {
    if (currentPath.length > 1) {
      setCurrentPath(currentPath.slice(0, -1));
    } else if (currentPath.length === 1 && currentPath[0] !== 'root') {
      setCurrentPath(['root']);
    }
  };

  // Handle clicking on path breadcrumb
  const handlePathClick = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  const getFileIcon = (item: ExplorerItem) => {
    if (item.type === 'folder') {
      return (
        <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
        </svg>
      );
    }

    // File icons based on extension
    const iconClass = 'w-8 h-8';
    
    switch (item.extension) {
      case 'txt':
        return (
          <svg className={`${iconClass} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'json':
        return (
          <svg className={`${iconClass} text-green-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return (
          <svg className={`${iconClass} text-purple-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className={`${iconClass} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-black text-oldgreen border border-dashed border-oldgreen">
      {/* Navigation Bar */}
      <div className="bg-black px-3 py-2 flex items-center gap-2 border-b border-dashed border-oldgreen">
        <button
          onClick={handleNavigateUp}
          disabled={currentPath.length <= 1}
          className="p-1 text-oldgreen hover:bg-oldgreen hover:text-black rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
        <div className="flex items-center gap-1 text-sm overflow-x-auto">
          {currentPath.map((folder, index) => (
            <span key={index} className="flex items-center">
              {index > 0 && <span className="mx-1">/</span>}
              <button
                onClick={() => setCurrentPath(currentPath.slice(0, index + 1))}
                className="hover:bg-oldgreen hover:text-black px-1 py-0.5 rounded"
              >
                {folder}
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-auto p-2">
        {items.length === 0 ? (
          <div className="text-oldgreen/50 text-center py-8">Empty folder</div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {items.map((item) => (
              <button
                key={item.id}
                onDoubleClick={() => handleDoubleClick(item)}
                className="flex flex-col items-center p-2 rounded hover:bg-oldgreen/20 transition-colors"
              >
                {getFileIcon(item)}
                <span className="text-xs text-oldgreen mt-1 text-center truncate w-full">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-black border-t border-dashed border-oldgreen px-3 py-1 text-xs text-oldgreen/70">
        {items.length} items
      </div>
    </div>
  );
}

// Metadata for the window system
FileExplorer.metadata = {
  title: "File Explorer",
  icon: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
    </svg>
  ),
};
