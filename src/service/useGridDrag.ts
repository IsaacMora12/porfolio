import { useCallback, useRef, useState, type RefObject } from 'react';
import type { IconPosition } from '../domain/icon/types';

interface UseGridDragProps<T extends HTMLElement> {
  id: string;
  onDrop: (id: string, position: IconPosition) => void;
  gridCellSize: { width: number; height: number };
  ref: RefObject<T | null>;
  threshold?: number;
}

export function useGridDrag<T extends HTMLElement>({ id, onDrop, gridCellSize, ref, threshold = 5 }: UseGridDragProps<T>) {
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const initialMousePosRef = useRef({ x: 0, y: 0 });
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const gridRect = document.querySelector('.desktop-grid')?.getBoundingClientRect();
        if (gridRect) {
          const mouseX = e.clientX - gridRect.left;
          const mouseY = e.clientY - gridRect.top;
          const col = Math.floor(mouseX / gridCellSize.width);
          const row = Math.floor(mouseY / gridCellSize.height);
          onDrop(id, { col, row });
        }
        isDraggingRef.current = false;
        setDragPosition(null);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    },
    [id, onDrop, gridCellSize]
  );

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDraggingRef.current) {
      e.preventDefault();
      setDragPosition({ 
        x: e.clientX - dragOffsetRef.current.x,
        y: e.clientY - dragOffsetRef.current.y,
      });
    } else {
      const dx = e.clientX - initialMousePosRef.current.x;
      const dy = e.clientY - initialMousePosRef.current.y;
      if (Math.sqrt(dx * dx + dy * dy) > threshold) {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          dragOffsetRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          };
          isDraggingRef.current = true;
          setDragPosition({ 
            x: e.clientX - dragOffsetRef.current.x,
            y: e.clientY - dragOffsetRef.current.y,
          });
        }
      }
    }
  }, [ref, threshold]);

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      initialMousePosRef.current = { x: e.clientX, y: e.clientY };
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [handleMouseMove, handleMouseUp]
  );

  return { handleDragStart, dragPosition, isDragging: isDraggingRef.current };
}
