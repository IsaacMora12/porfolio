import { useState, useEffect, useRef } from 'react';
import { fileSystemService } from '../domain/filesystem/FileSystemService';
import { windowEvents } from '../domain/window/WindowEvents';

interface TextEditorProps {
  fileName?: string;
  fileId?: string;
  onClose?: () => void;
}

export default function TextEditor({ fileName, fileId, onClose }: TextEditorProps) {
  const [content, setContent] = useState('');
  const [lines, setLines] = useState<number[]>([1]);
  const [cursorLine, setCursorLine] = useState(0);
  const [cursorCol, setCursorCol] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [displayFileName, setDisplayFileName] = useState(fileName || 'Untitled');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load file content on mount
  useEffect(() => {
    let loadedContent = '';
    let loadedFileName = fileName || 'Untitled';

    // If we have a file ID, try to get file by ID first
    if (fileId) {
      const file = fileSystemService.getFileById(fileId);
      if (file) {
        loadedContent = file.content || '';
        loadedFileName = file.name;
      }
    } else if (fileName) {
      // Otherwise find by name in current directory
      const items = fileSystemService.lsDirect();
      const file = items.find(item => item.name === fileName && item.type !== 'folder');
      if (file && 'content' in file) {
        loadedContent = file.content || '';
      }
    }

    setContent(loadedContent);
    setDisplayFileName(loadedFileName);
    
    // Focus textarea after render
    setTimeout(() => textareaRef.current?.focus(), 0);
  }, [fileName, fileId]);

  // Update line numbers when content changes
  useEffect(() => {
    const newLines = content.split('\n').map((_, i) => i + 1);
    setLines(newLines);
  }, [content]);

  // Handle cursor position
  const handleCursorMove = (text: string, position: number) => {
    const textLines = text.substring(0, position).split('\n');
    setCursorLine(textLines.length - 1);
    setCursorCol(textLines[textLines.length - 1].length);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle Tab key
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      setContent(newContent);
      
      // Move cursor after tab
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        handleCursorMove(newContent, start + 2);
      }, 0);
    }
    
    // Ctrl+G to show help
    if (e.ctrlKey && e.key === 'g') {
      e.preventDefault();
      setStatusMessage('TextEditor help: Ctrl+O save, Ctrl+X exit, Ctrl+G help');
      setTimeout(() => setStatusMessage(''), 3000);
    }
    
    // Ctrl+O to save
    if (e.ctrlKey && e.key === 'o') {
      e.preventDefault();
      saveFile();
    }
    
    // Ctrl+X to exit
    if (e.ctrlKey && e.key === 'x') {
      e.preventDefault();
      if (onClose) {
        onClose();
      } else {
        windowEvents.emit('close-texteditor');
      }
    }
  };

  const saveFile = () => {
    if (displayFileName && displayFileName !== 'Untitled') {
      const result = fileSystemService.writeFile(displayFileName, content);
      if (result.success) {
        setStatusMessage(`[${displayFileName}] File saved`);
        setTimeout(() => setStatusMessage(''), 2000);
      } else {
        setStatusMessage(`Error: ${result.message}`);
      }
    } else {
      setStatusMessage('No file name specified');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    handleCursorMove(newContent, e.target.selectionStart);
  };

  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    handleCursorMove(content, textarea.selectionStart);
  };

  const lineCount = lines.length;

  return (
    <div 
      className="h-full flex flex-col bg-black text-oldgreen font-mono text-sm overflow-hidden"
      onClick={() => textareaRef.current?.focus()}
    >
      {/* Header */}
      <div className="bg-black border-b border-oldgreen border-dashed px-2 py-1 text-xs flex justify-between items-center">
        <span>TextEditor - {displayFileName}</span>
        <span className="text-xs opacity-75">Ctrl+O Save | Ctrl+X Exit</span>
      </div>
      
      {/* Editor area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line numbers */}
        <div className="bg-black text-oldgreen/50 text-right pr-2 py-1 select-none border-r border-dashed border-oldgreen min-w-[50px]">
          {lines.map(num => (
            <div key={num} className="leading-6">{num}</div>
          ))}
        </div>
        
        {/* Text area */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onSelect={handleSelect}
            onKeyDown={handleKeyDown}
            className="w-full h-full p-1 resize-none outline-none leading-6 font-mono bg-black text-oldgreen"
            spellCheck={false}
          />
        </div>
      </div>
      
      {/* Status bar */}
      <div className="bg-black border-t border-oldgreen border-dashed px-2 py-1 text-xs flex justify-between">
        <span>
          {statusMessage || `Modified | Lines: ${lineCount} | ${cursorLine + 1}:${cursorCol + 1}`}
        </span>
        <span>UTF-8</span>
      </div>
      
      {/* Help footer */}
      <div className="bg-black border-t border-oldgreen border-dashed px-2 py-1 text-xs flex justify-between overflow-x-auto">
        <span>^G Help ^O WriteOut ^R Read File ^Y Prev Pg ^C Cur Pos</span>
        <span>^X Exit ^J Justify ^W Where is ^K Cut Text ^U UnCut Text</span>
      </div>
    </div>
  );
}

// Metadata for the window system
TextEditor.metadata = {
  title: "TextEditor",
  icon: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487 1.687 18.75a2.169 2.169 0 0 0 .774 1.262l7.5 4.375a2.169 2.169 0 0 0 2.699 0l7.5-4.375a2.169 2.169 0 0 0 .774-1.262l-15.3-16.263Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m7.5 7.5.75-.75a2.25 2.25 0 0 1 3.182 0l2.909 2.969m6-3.182 1.5 1.5a2.25 2.25 0 0 1 0 3.182l-7.5 4.375a2.25 2.25 0 0 1-3.182 0l-2.909-2.969a2.25 2.25 0 0 1 0-3.182l1.5-1.5Z" />
    </svg>
  ),
};