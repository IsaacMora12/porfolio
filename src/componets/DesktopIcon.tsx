import React, { useRef, useCallback } from 'react';
import type { IconState, IconPosition } from '../domain/icon/types';
import { useGridDrag } from '../service/useGridDrag';

interface DesktopIconProps extends IconState {
  onDrop: (id: string, position: IconPosition) => void;
  gridCellSize: { width: number; height: number };
}

const DesktopIcon: React.FC<DesktopIconProps> = (props) => {
  const { id, title, position, onDrop, gridCellSize, action, iconLogo } = props;
  const ref = useRef<HTMLDivElement>(null);
  const wasDraggingRef = useRef(false);

  const wrappedOnDrop = useCallback((dropId: string, pos: IconPosition) => {
    wasDraggingRef.current = true;
    onDrop(dropId, pos);
  }, [onDrop]);

  const { handleDragStart, dragPosition, isDraggingRef } = useGridDrag<HTMLDivElement>({
    id,
    onDrop: wrappedOnDrop,
    gridCellSize,
    ref,
  });

  const handleDoubleClick = useCallback(() => {
    // Only open if we weren't just dragging
    if (!wasDraggingRef.current) {
      action();
    }
    wasDraggingRef.current = false;
  }, [action]);

  const handleMouseUp = useCallback(() => {
    // Reset drag flag after a short delay
    setTimeout(() => {
      wasDraggingRef.current = false;
    }, 200);
  }, []);

  const style: React.CSSProperties = {
    width: gridCellSize.width,
    height: gridCellSize.height,
    textAlign: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    gridColumn: `${position.col + 1}`,
    gridRow: `${position.row + 1}`,
    zIndex: isDraggingRef.current ? 1000 : 1,
  };

  if (isDraggingRef.current && dragPosition) {
    style.position = 'absolute';
    style.top = `${dragPosition.y}px`;
    style.left = `${dragPosition.x}px`;
  }

  const getIcon = () => {
    switch (iconLogo) {
      case 'terminal':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8 text-oldgreen">
            <path strokeLinecap="round" strokeLinejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        );
      case 'explorer':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8 text-oldgreen">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
          </svg>
        );
      case 'folder':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8 text-oldgreen">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8 text-oldgreen">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
        );
    }
  };

  return (
    <div ref={ref} style={style} onMouseDown={handleDragStart} onMouseUp={handleMouseUp} onDoubleClick={handleDoubleClick}>
      <div className="flex flex-col items-center justify-center p-2">
        <span className="text-4xl">
          {getIcon()}
        </span>
        <span className="text-sm text-oldgreen mt-1 truncate">{title}</span>
      </div>
    </div>
  );
};

export default DesktopIcon;
