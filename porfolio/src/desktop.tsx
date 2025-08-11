import { useMemo } from 'react';
import WindowComponent from './componets/window';
import { useWindowManager } from './domain/window/useWindowManager';
import { CurriculumComponent } from './pages/Curriculo';

// Keep for potential future layout calculations

function Desktop() {
  const { windows, create, bringToFront, move, resize, close, minimize, toggleMaximize } = useWindowManager();

  const minimized = useMemo(() => windows.filter((w) => w.isMinimized), [windows]);
  console.log(windows)
  return (
    <section className="w-screen h-screen overflow-hidden bg-[--color-abbadinBlack] text-neutral-100">
      <div className="relative w-full h-[calc(100vh-48px)]">
     

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
<div>
<button
          onClick={() => create({ title: 'Currículum', content: <CurriculumComponent /> })}
          className="px-3 py-1.5 bg-yellow-500 text-black rounded font-semibold hover:opacity-90 active:opacity-80"
        >
          Ver Currículum
        </button>
        </div>
      </div>
     
      <div className="fixed bottom-0 left-0 right-0 h-12 bg-neutral-900/80 backdrop-blur border-t border-neutral-800 flex items-center gap-2 px-3">
        {/* <button
          onClick={() => create({ title: `Window ${windows.length + 1}` })}
          className="px-3 py-1.5 bg-[--color-oldgreen] text-black rounded font-semibold hover:opacity-90 active:opacity-80"
        >
          New Window
        </button> */}

        <div className="flex items-center gap-2 overflow-x-auto">
          {minimized.map((w) => (
            <button
              key={w.id}
              onClick={() => bringToFront(w.id)}
              className="px-2 py-1 bg-neutral-800 text-neutral-200 rounded hover:bg-neutral-700"
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