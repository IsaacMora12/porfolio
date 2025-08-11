// useResize.ts
import { useCallback, useEffect, useRef } from 'react';
import type { WindowPosition, WindowSize } from '../domain/window/types';

export type ResizeDirection =
  | 'n'
  | 's'
  | 'e'
  | 'w'
  | 'ne'
  | 'nw'
  | 'se'
  | 'sw';

interface UseResizeProps {
  id: string;
  isMaximized: boolean;
  position: WindowPosition;
  size: WindowSize;
  onResize: (id: string, width: number, height: number, x: number, y: number) => void;
}

const MIN_WIDTH = 260;
const MIN_HEIGHT = 160;
const TASKBAR_HEIGHT = 48;

export function useResize({ id, isMaximized, position, size, onResize }: UseResizeProps) {
  const resizeStateRef = useRef<{
    startMouseX: number;
    startMouseY: number;
    startWidth: number;
    startHeight: number;
    startX: number;
    startY: number;
    isResizing: boolean;
    direction: ResizeDirection | null;
  }>({
    startMouseX: 0,
    startMouseY: 0,
    startWidth: 0,
    startHeight: 0,
    startX: 0,
    startY: 0,
    isResizing: false,
    direction: null,
  });

  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (resizeStateRef.current.isResizing && !isMaximized) {
        const { startMouseX, startMouseY, startWidth, startHeight, startX, startY, direction } =
          resizeStateRef.current;
        const dx = e.clientX - startMouseX;
        const dy = e.clientY - startMouseY;

        let nextWidth = startWidth;
        let nextHeight = startHeight;
        let nextX = startX;
        let nextY = startY;

        // Lógica para redimensionar desde los bordes
        if (direction?.includes('e')) {
          nextWidth = clamp(startWidth + dx, MIN_WIDTH, window.innerWidth - startX);
        }
        if (direction?.includes('w')) {
          const newWidth = clamp(startWidth - dx, MIN_WIDTH, startX + startWidth);
          nextX = startX + (startWidth - newWidth);
          nextWidth = newWidth;
        }
        if (direction?.includes('s')) {
          nextHeight = clamp(startHeight + dy, MIN_HEIGHT, window.innerHeight - TASKBAR_HEIGHT - startY);
        }
        if (direction?.includes('n')) {
          const newHeight = clamp(startHeight - dy, MIN_HEIGHT, startY + startHeight);
          nextY = startY + (startHeight - newHeight);
          nextHeight = newHeight;
        }

        onResize(id, nextWidth, nextHeight, nextX, nextY);
      }
    },
    [id, isMaximized, onResize]
  );

  const handleMouseUp = useCallback(() => {
    resizeStateRef.current.isResizing = false;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseleave', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, direction: ResizeDirection) => {
      if (isMaximized) return;
      e.stopPropagation();
      resizeStateRef.current = {
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startWidth: size.width,
        startHeight: size.height,
        startX: position.x,
        startY: position.y,
        isResizing: true,
        direction,
      };
    },
    [isMaximized, position, size]
  );

  return { handleMouseDown };
}
