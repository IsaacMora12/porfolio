import { useState, useRef, useEffect, useCallback } from 'react';
import { terminalService } from '../service/TerminalService';
import type { TerminalLine } from '../service/TerminalService';
import { fileSystemService } from '../domain/filesystem/FileSystemService';

interface CommandWithPath {
  line: TerminalLine;
  path: string;
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
  
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

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

  return (
    <div 
      className="h-full bg-black p-3 text-oldgreen font-mono text-sm overflow-auto"
      onClick={() => inputRef.current?.focus()}
      ref={terminalRef}
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
