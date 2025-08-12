// useDrag.ts
import { useCallback, useEffect, useRef } from 'react';
import type { WindowPosition } from '../domain/window/types';

interface UseDragProps {
  id: string;
  isMaximized: boolean;
  position: WindowPosition;
  onMove: (id: string, x: number, y: number) => void;
}

const MIN_WIDTH = 260; 
const MIN_HEIGHT = 160;
const TASKBAR_HEIGHT = 48;

export function useDrag({ id, isMaximized, position, onMove }: UseDragProps) {
  const dragStateRef = useRef<{
    startMouseX: number;
    startMouseY: number;
    startX: number;
    startY: number;
    isDragging: boolean;
  }>({ startMouseX: 0, startMouseY: 0, startX: 0, startY: 0, isDragging: false });

  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (dragStateRef.current.isDragging && !isMaximized) {
        const dx = e.clientX - dragStateRef.current.startMouseX;
        const dy = e.clientY - dragStateRef.current.startMouseY;
        const bounds = { maxX: window.innerWidth, maxY: window.innerHeight - TASKBAR_HEIGHT };
        
        const nextX = clamp(dragStateRef.current.startX + dx, 0, Math.max(0, bounds.maxX - MIN_WIDTH));
        const nextY = clamp(dragStateRef.current.startY + dy, 0, Math.max(0, bounds.maxY - MIN_HEIGHT));
        
        onMove(id, nextX, nextY);
      }
    },
    [id, isMaximized, onMove]
  );

  const handleMouseUp = useCallback(() => {
    dragStateRef.current.isDragging = false;
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

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isMaximized) return;
    dragStateRef.current = {
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startX: position.x,
      startY: position.y,
      isDragging: true,
    };
  }, [isMaximized, position]);

  return { handleMouseDown };
}