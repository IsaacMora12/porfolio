import { useState, useRef, useEffect, useCallback } from 'react';
import { terminalService } from '../service/TerminalService';
import type { TerminalLine } from '../service/TerminalService';
import { fileSystemService } from '../domain/filesystem/FileSystemService';
import { windowEvents } from '../domain/window/WindowEvents';

interface CommandWithPath {
  line: TerminalLine;
  path: string;
}

// Nano editor state interface
interface NanoState {
  active: boolean;
  fileName: string;
  content: string;
  cursorLine: number;
  cursorCol: number;
}

export default function Terminal() {
  const [commands, setCommands] = useState<CommandWithPath[]>([
    { 
      line: { type: 'output', content: 'Welcome to Portfolio Terminal v1.0.0' }, 
      path: '' 
    },
    { 
      line: { type: 'output', content: 'Type "help" for available commands.\n' }, 
      path: '' 
    },
  ]);
  const [input, setInput] = useState('');
  const [currentPath, setCurrentPath] = useState(() => {
    // Always start at Desktop folder
    fileSystemService.cd('/root/home/user/Desktop');
    return fileSystemService.pwd();
  });
  
  // Nano editor state
  const [nanoState, setNanoState] = useState<NanoState>({
    active: false,
    fileName: '',
    content: '',
    cursorLine: 0,
    cursorCol: 0,
  });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const nanoTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Subscribe to open-nano event
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

      let content = '';
      
      // If we have a file ID, try to get file by ID
      if (fileId) {
        const file = fileSystemService.getFileById(fileId);
        if (file) {
          content = file.content || '';
          name = file.name;
        }
      } else {
        // Otherwise find by name in current directory
        const items = fileSystemService.lsDirect();
        const file = items.find(item => item.name === name && item.type !== 'folder');
        content = file && 'content' in file ? file.content : '';
      }
      
      setNanoState({
        active: true,
        fileName: name,
        content: content,
        cursorLine: 0,
        cursorCol: 0,
      });
      
      // Add message to terminal
      setCommands(prev => [...prev, {
        line: { type: 'output', content: `Opening nano for: ${name}` },
        path: currentPath
      }]);
      
      // Focus textarea after render
      setTimeout(() => nanoTextareaRef.current?.focus(), 0);
    };
    
    windowEvents.on('open-nano', handleOpenNano);
    return () => windowEvents.off('open-nano', handleOpenNano);
  }, [currentPath]);
  
  // Subscribe to file system changes
  useEffect(() => {
    const unsubscribe = fileSystemService.subscribe(() => {
      setCurrentPath(fileSystemService.pwd());
    });
    return unsubscribe;
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commands]);

  // Focus input when terminal is mounted
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleExecute = useCallback(() => {
    if (!input.trim()) {
      setCommands(prev => [...prev, { 
        line: { type: 'input', content: '' }, 
        path: fileSystemService.pwd() 
      }]);
      return;
    }

    const result = terminalService.execute(input);
    
    // Handle clear command - when result is empty and command was 'clear'
    if (result.length === 0 && input.trim() === 'clear') {
      setCommands([]);
      setInput('');
      return;
    }

    // Get the path BEFORE executing the command (so input shows current path)
    const pathBeforeCommand = fileSystemService.pwd();
    
    // Add each result line
    const newCommands: CommandWithPath[] = [];
    
    // Check if the result already contains an input line (e.g., command not found)
    const hasInputLine = result.some((line: TerminalLine) => line.type === 'input');
    
    // Add input line only if not already present in result
    if (!hasInputLine) {
      newCommands.push({
        line: { type: 'input', content: input },
        path: pathBeforeCommand
      });
    }
    
    // Add output lines from the result
    result.forEach((line: TerminalLine) => {
      newCommands.push({
        line,
        path: pathBeforeCommand
      });
    });

    setCommands(prev => [...prev, ...newCommands]);
    setInput('');
    
    // Update current path after command (for the next prompt)
    setCurrentPath(fileSystemService.pwd());
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleExecute();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = terminalService.getPreviousCommand();
      setInput(prev);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = terminalService.getNextCommand();
      setInput(next);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const completions = terminalService.getAutocomplete(input);
      if (completions.length === 1) {
        const parts = input.split(/\s+/);
        parts[parts.length - 1] = completions[0];
        setInput(parts.join(' ') + ' ');
      } else if (completions.length > 1) {
        setCommands(prev => [
          ...prev,
          { line: { type: 'input', content: input }, path: fileSystemService.pwd() },
          { line: { type: 'output', content: completions.join('  ') }, path: fileSystemService.pwd() },
        ]);
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setCommands([]);
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      setCommands(prev => [...prev, { 
        line: { type: 'output', content: '^C' }, 
        path: fileSystemService.pwd() 
      }]);
    }
  };

  const formatPath = (path: string): string => {
    if (!path) return '';
    return path.replace('/home/user', '~');
  };

  // Handle nano editor key events
  const handleNanoKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = nanoTextareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = nanoState.content.substring(0, start) + '  ' + nanoState.content.substring(end);
      setNanoState(prev => ({ ...prev, content: newContent }));
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
    
    // Ctrl+O to save
    if (e.ctrlKey && e.key === 'o') {
      e.preventDefault();
      const result = fileSystemService.writeFile(nanoState.fileName, nanoState.content);
      if (result.success) {
        setCommands(prev => [...prev, {
          line: { type: 'output', content: `[${nanoState.fileName}] File saved` },
          path: currentPath
        }]);
      }
    }
    
    // Ctrl+X to exit
    if (e.ctrlKey && e.key === 'x') {
      e.preventDefault();
      setNanoState(prev => ({ ...prev, active: false }));
      setInput('');
      setTimeout(() => inputRef.current?.focus(), 0);
    }
    
    // Ctrl+G for help
    if (e.ctrlKey && e.key === 'g') {
      e.preventDefault();
      setCommands(prev => [...prev, {
        line: { type: 'output', content: 'Nano help: Ctrl+O save, Ctrl+X exit, Ctrl+G help' },
        path: currentPath
      }]);
    }
  };

  // Handle nano content change
  const handleNanoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNanoState(prev => ({ ...prev, content: e.target.value }));
  };

  // Render nano editor or terminal
  if (nanoState.active) {
    const lines = nanoState.content.split('\n');
    return (
      <div 
        className="h-full bg-gray-900 p-3 text-gray-300 font-mono text-sm overflow-hidden flex flex-col"
        onClick={() => nanoTextareaRef.current?.focus()}
      >
        {/* Header */}
        <div className="bg-blue-600 text-white px-2 py-1 text-xs flex justify-between items-center">
          <span>Nano - {nanoState.fileName}</span>
          <span className="text-xs opacity-75">Ctrl+O Save | Ctrl+X Exit</span>
        </div>
        
        {/* Editor area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Line numbers */}
          <div className="bg-gray-800 text-gray-500 text-right pr-2 py-1 select-none border-r border-gray-700 min-w-[40px]">
            {lines.map((_, i) => (
              <div key={i} className="leading-6">{i + 1}</div>
            ))}
          </div>
          
          {/* Text area */}
          <div className="flex-1 relative">
            <textarea
              ref={nanoTextareaRef}
              value={nanoState.content}
              onChange={handleNanoChange}
              onKeyDown={handleNanoKeyDown}
              className="w-full h-full p-1 resize-none outline-none leading-6 font-mono bg-gray-900 text-gray-300"
              spellCheck={false}
            />
          </div>
        </div>
        
        {/* Status bar */}
        <div className="bg-blue-600 text-white px-2 py-1 text-xs flex justify-between">
          <span>Modified | Lines: {lines.length}</span>
          <span>UTF-8</span>
        </div>
        
        {/* Help footer */}
        <div className="bg-gray-800 text-gray-400 px-2 py-1 text-xs flex justify-between overflow-x-auto">
          <span>^G Help ^O WriteOut ^R Read File ^Y Prev Pg ^C Cur Pos</span>
          <span>^X Exit ^J Justify ^W Where is</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-full bg-black p-3 text-oldgreen font-mono text-sm overflow-auto"
      onClick={() => inputRef.current?.focus()}
    >
      {commands.map((cmd, index) => (
        <div key={index} className="whitespace-pre-wrap">
          {cmd.line.type === 'input' && (
            <span className="text-white">
              <span className="text-blue-400">user@portfolio</span>:
              <span className="text-purple-400">{formatPath(cmd.path)}$</span>{' '}
              {cmd.line.content}
            </span>
          )}
          {cmd.line.type === 'output' && (
            <span className="text-oldgreen">{cmd.line.content}</span>
          )}
          {cmd.line.type === 'error' && (
            <span className="text-red-400">{cmd.line.content}</span>
          )}
        </div>
      ))}
      
      {/* Input Line */}
      <div className="flex items-center">
        <span className="text-blue-400">user@portfolio</span>:
        <span className="text-purple-400">{formatPath(currentPath)}$</span>{' '}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none text-white caret-oldgreen"
          autoComplete="off"
          spellCheck={false}
        />
      </div>
    </div>
  );
}

// Metadata for the window system
Terminal.metadata = {
  title: "Terminal",
  icon: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  ),
};
