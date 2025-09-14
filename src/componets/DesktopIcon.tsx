import React, { useRef } from 'react';
import type { IconState, IconPosition } from '../domain/icon/types';
import { useGridDrag } from '../service/useGridDrag';

interface DesktopIconProps extends IconState {
  onDrop: (id: string, position: IconPosition) => void;
  gridCellSize: { width: number; height: number };
}

const DesktopIcon: React.FC<DesktopIconProps> = (props) => {
  const { id, title, position, onDrop, gridCellSize, action } = props;
  const ref = useRef<HTMLDivElement>(null);

  const { handleDragStart, dragPosition, isDragging } = useGridDrag<HTMLDivElement>({
    id,
    onDrop,
    gridCellSize,
    ref,
  });

  const style: React.CSSProperties = {
    width: gridCellSize.width,
    height: gridCellSize.height,
    textAlign: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    gridColumn: `${position.col + 1}`,
    gridRow: `${position.row + 1}`,
    zIndex: isDragging ? 1000 : 1,
  };

  if (isDragging && dragPosition) {
    style.position = 'absolute';
    style.top = `${dragPosition.y}px`;
    style.left = `${dragPosition.x}px`;
  }

  return (
    <div ref={ref} style={style} onMouseDown={handleDragStart} onDoubleClick={action}>
      <div className="flex flex-col items-center justify-center p-2">
        <span className="text-4xl">
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8 text-oldgreen">
  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
</svg>


        </span>
        <span className="text-sm text-oldgreen mt-1 truncate">{title}</span>
      </div>
    </div>
  );
};

export default DesktopIcon;
