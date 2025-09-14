import React from 'react';
import type { WindowPosition, WindowSize } from '../domain/window/types';
import { useDrag } from '../service/useDrag';
import { useResize } from '../service/useResize';

export interface WindowProps {
  id: string;
  title: string;
  position: WindowPosition;
  size: WindowSize;
  zIndex: number;
  isActive: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  onFocus: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number, x: number, y: number) => void;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onToggleMaximize: (id: string) => void;
  children?: React.ReactNode;
}

const TASKBAR_HEIGHT = 48; // px, keep in sync with Desktop taskbar

export default function WindowComponent(props: WindowProps) {
  const {
    id,
    title,
    position,
    size,
    zIndex,
    isActive,
    isMinimized,
    isMaximized,
    onFocus,
    onMove,
    onResize,
    onClose,
    onMinimize,
    onToggleMaximize,
    children,
  } = props;

  const { handleMouseDown: handleMouseDownHeader } = useDrag({
    id,
    isMaximized,
    position,
    onMove,
  });

  // Pasamos la función onResize del componente al hook
  const { handleMouseDown: handleMouseDownResize } = useResize({
    id,
    isMaximized,
    position,
    size,
    onResize,
  });
 
  const style: React.CSSProperties = isMaximized
    ? {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: `calc(100vh - ${TASKBAR_HEIGHT}px)`,
        zIndex,
      }
    : {
        position: 'absolute',
        top: position.y,
        left: position.x,
        width: size.width,
        height: size.height,
        zIndex,
      };

  if (isMinimized) {
    style.display = 'none';
  }

  const activeRing = isActive ? 'ring-2 ring-[--color-oldgreen]' : 'ring-1 ring-neutral-700';

  return (
    <div
      style={style}
      className={`select-none rounded-md shadow-lg pb-2 bg-black text-oldgreen border border-dashed border-oldgreen ${activeRing}`}
      onMouseDown={() => onFocus(id)}
    >
      <div
        className="flex items-center justify-stretch px-3 py-1.5 cursor-move bg-black rounded-t-md border-b border-dashed border-oldgreen"
        onMouseDown={handleMouseDownHeader}>
            <div className='w-full'>
      <span className="ml-2 font-medium text-sm text-oldgreen">{title}</span>
      </div>
        <div className="flex items-center justify-center gap-2 bg-black ">
        
           
          <span className="cursor-pointer group p-2 hover:bg-oldgreen rounded-lg" onClick={() => onMinimize(id)} > 
    
          <svg 
    className="w-3 h-3 text-oldgreen stroke-current group-hover:text-black " 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg">
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
    <g id="SVGRepo_iconCarrier">
      <g clipPath="url(#clip0_429_10979)">
        <path d="M6 12H18" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
      </g>
      <defs>
        <clipPath id="clip0_429_10979">
          <rect width="24" height="24" fill="white"></rect>
        </clipPath>
      </defs>
    </g>
  </svg>
          </span>
          <span className=" cursor-pointer group p-2 hover:bg-oldgreen rounded-lg" onClick={() => onToggleMaximize(id)} > 
          <svg 
  className="text-oldgreen group-hover:text-black w-3 h-3 stroke-current" 
  viewBox="0 0 24 24" 
  fill="none" 
  xmlns="http://www.w3.org/2000/svg" 
  transform="matrix(-1, 0, 0, 1, 0, 0)rotate(0)">
  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
  <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
  <g id="SVGRepo_iconCarrier">
    <g clipPath="url(#clip0_429_11155)">
      <path d="M16 3H4V16" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
      <path d="M8 7H20V19C20 20.1046 19.1046 21 18 21H10C8.89543 21 8 20.1046 8 19V7Z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
    </g>
    <defs>
      <clipPath id="clip0_429_11155">
        <rect width="24" height="24" fill="white"></rect>
      </clipPath>
    </defs>
  </g>
</svg>
      

          </span>

          <span className="group cursor-pointer p-2 hover:bg-oldgreen rounded-lg " onClick={() => onClose(id)}>
            <svg 
                className="text-oldgreen group-hover:text-black w-3 h-3 stroke-current" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg">
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                <g id="SVGRepo_iconCarrier"> 
                <g clipPath="url(#clip0_429_10978)"> 
                    <path d="M16.9999 7.00004L6.99994 17" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path> 
                    <path d="M7.00006 7.00003L17.0001 17" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path> 
                </g> 
                <defs> 
                    <clipPath id="clip0_429_10978"> 
                    <rect width="24" height="24" fill="white"></rect> 
                    </clipPath> 
                </defs> 
                </g>
            </svg> 
            </span>
       
        </div>
      </div>

      <div className="w-full h-[calc(100%-2.25rem)] p-3 overflow-auto">
        {children}
      </div>

      {!isMaximized && (
        <>
        <div className="resize-handle n" onMouseDown={(e) => handleMouseDownResize(e, 'n')} />
        <div className="resize-handle s" onMouseDown={(e) => handleMouseDownResize(e, 's')} />
        <div className="resize-handle e" onMouseDown={(e) => handleMouseDownResize(e, 'e')} />
        <div className="resize-handle w" onMouseDown={(e) => handleMouseDownResize(e, 'w')} />
        <div className="resize-handle ne" onMouseDown={(e) => handleMouseDownResize(e, 'ne')} />
        <div className="resize-handle nw" onMouseDown={(e) => handleMouseDownResize(e, 'nw')} />
        <div className="resize-handle se" onMouseDown={(e) => handleMouseDownResize(e, 'se')} />
        <div className="resize-handle sw" onMouseDown={(e) => handleMouseDownResize(e, 'sw')} />
      </>
      )}
    </div>
  );
}


