import React from 'react';
import type { IconState, IconPosition } from '../domain/icon/types';
import DesktopIcon from './DesktopIcon';

const GRID_CELL_SIZE = { width: 90, height: 90 };

interface DesktopGridProps {
  icons: IconState[];
  onIconDrop: (id: string, position: IconPosition) => void;
}

const DesktopGrid: React.FC<DesktopGridProps> = ({ icons, onIconDrop }) => {

  const gridTemplateColumns = `repeat(auto-fill, minmax(${GRID_CELL_SIZE.width}px, 1fr))`;
  const gridAutoRows = `${GRID_CELL_SIZE.height}px`;

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: gridTemplateColumns,
    gridAutoRows: gridAutoRows,
    width: '100%',
    height: '100%',
  };

  return (
    <div className="relative w-full h-full desktop-grid" style={gridStyle}>
      {icons.map((icon) => (
        <DesktopIcon
          key={icon.id}
          {...icon}
          onDrop={onIconDrop}
          gridCellSize={GRID_CELL_SIZE}
        />
      ))}
    </div>
  );
};

export default DesktopGrid;