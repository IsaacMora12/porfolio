import { fileSystemService } from '../domain/filesystem/FileSystemService';
import { windowEvents } from '../domain/window/WindowEvents';
import type { TerminalCommand, FileNode } from '../domain/filesystem/types';

export interface TerminalLine {
  type: 'input' | 'output' | 'error';
  content: string;
}

export class TerminalService {
  private history: string[] = [];
  private historyIndex: number = -1;
  private currentInput: string = '';
  
  private commands: TerminalCommand[] = [
    {
      name: 'help',
      description: 'Show available commands',
      execute: () => {
        return this.commands
          .map(cmd => `  ${cmd.name.padEnd(10)} - ${cmd.description}`)
          .join('\n');
      },
    },
    {
      name: 'clear',
      description: 'Clear the terminal',
      execute: () => {
        return '__CLEAR__';
      },
    },
    {
      name: 'pwd',
      description: 'Print working directory',
      execute: () => {
        return fileSystemService.pwd();
      },
    },
    {
      name: 'ls',
      description: 'List directory contents (flat or tree format)',
      execute: (args) => {
        console.log('[TerminalService] ls executing with args:', args);
        const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al');
        const treeFormat = args.includes('-t') || args.includes('--tree');
        
        // Get items directly from current folder (bypasses path resolution)
        const items = fileSystemService.lsDirect();
        console.log('[TerminalService] ls items returned:', items.length);
        const filteredItems = showAll ? items : items.filter(item => !item.name.startsWith('.'));
        
        if (filteredItems.length === 0) {
          return '(empty directory)';
        }
        
        // Use tree format if -t flag is provided
        if (treeFormat) {
          const tree = fileSystemService.tree();
          return tree || '(empty directory)';
        }
        
        // Default: columnar format (like Unix ls)
        // Prepare items with their display names and colors
        const itemsWithMeta = filteredItems.map(item => {
          let color = '';
          const reset = '\x1b[0m';
          if (item.type === 'folder') {
            color = '\x1b[34m'; // Blue for folders
          } else {
            const fileNode = item as FileNode;
            const ext = fileNode.extension;
            if (ext === 'json') {
              color = '\x1b[32m'; // Green for JSON
            } else if (ext === 'md') {
              color = '\x1b[35m'; // Magenta for Markdown
            }
          }
          return {
            name: item.name,
            display: color ? `${color}${item.name}${item.type === 'folder' ? '/' : ''}${reset}` : (item.type === 'folder' ? item.name + '/' : item.name),
            length: item.name.length + (item.type === 'folder' ? 1 : 0)
          };
        });

        // Format in columns like Unix ls
        if (itemsWithMeta.length === 0) {
          return '(empty directory)';
        }

        // Calculate column width based on longest item name
        const maxLen = Math.max(...itemsWithMeta.map(item => item.length));
        const colWidth = maxLen + 2; // Add padding
        const terminalWidth = 80; // Assume standard terminal width
        const numCols = Math.max(1, Math.floor(terminalWidth / colWidth));

        // Arrange items in columns
        const rows: string[] = [];
        for (let i = 0; i < itemsWithMeta.length; i += numCols) {
          const row = itemsWithMeta.slice(i, i + numCols).map((item) => {
            const padding = ' '.repeat(colWidth - item.length);
            return item.display + padding;
          }).join('');
          rows.push(row.trimEnd());
        }

        return rows.join('\n');
      },
    },
    {
      name: 'cd',
      description: 'Change directory',
      execute: (args) => {
        if (!args[0] || args[0] === '~') {
          // Go to home directory (/home/user)
          const result = fileSystemService.cd('/home/user');
          return result.success ? '' : result.message;
        }
        if (args[0] === '-') {
          // Go to previous directory - for now just go home
          const result = fileSystemService.cd('/home/user');
          return result.success ? '' : result.message;
        }
        const result = fileSystemService.cd(args[0]);
        return result.success ? '' : result.message;
      },
    },
    {
      name: 'mkdir',
      description: 'Create directory',
      execute: (args) => {
        console.log('[TerminalService] mkdir executing with args:', args);
        if (!args[0]) {
          return 'mkdir: missing operand';
        }
        const result = fileSystemService.mkdir(args[0]);
        console.log('[TerminalService] mkdir result:', result);
        return result.success ? '' : result.message;
      },
    },
    {
      name: 'touch',
      description: 'Create empty file',
      execute: (args) => {
        if (!args[0]) {
          return 'touch: missing file operand';
        }
        const result = fileSystemService.touch(args[0]);
        return result.success ? '' : result.message;
      },
    },
    {
      name: 'rm',
      description: 'Remove file or directory',
      execute: (args) => {
        if (!args[0]) {
          return 'rm: missing operand';
        }
        const recursive = args.includes('-r') || args.includes('-rf') || args.includes('-fr');
        const path = args.find(arg => !arg.startsWith('-')) || '';
        const result = fileSystemService.rm(path, recursive);
        return result.success ? '' : result.message;
      },
    },
    {
      name: 'cp',
      description: 'Copy file or directory',
      execute: (args) => {
        if (!args[0] || !args[1]) {
          return 'cp: missing file operand';
        }
        const result = fileSystemService.cp(args[0], args[1]);
        return result.success ? '' : result.message;
      },
    },
    {
      name: 'mv',
      description: 'Move/rename file or directory',
      execute: (args) => {
        if (!args[0] || !args[1]) {
          return 'mv: missing file operand';
        }
        const result = fileSystemService.mv(args[0], args[1]);
        return result.success ? '' : result.message;
      },
    },
    {
      name: 'cat',
      description: 'Display file contents',
      execute: (args) => {
        if (!args[0]) {
          return 'cat: missing operand';
        }
        const result = fileSystemService.cat(args[0]);
        if (!result.success) {
          return `\x1b[31m${result.message}\x1b[0m`;
        }
        return result.message;
      },
    },
    {
      name: 'echo',
      description: 'Display text',
      execute: (args) => {
        return args.join(' ');
      },
    },
    {
      name: 'whoami',
      description: 'Print current user',
      execute: () => {
        return 'user';
      },
    },
    {
      name: 'date',
      description: 'Print current date',
      execute: () => {
        return new Date().toString();
      },
    },
    {
      name: 'nano',
      description: 'Open text editor',
      execute: (args) => {
        if (!args[0]) {
          return 'nano: missing operand. Usage: nano <filename>';
        }
        const fileName = args[0];
        // Check if file exists
        const items = fileSystemService.lsDirect();
        const file = items.find(item => item.name === fileName && item.type !== 'folder');
        if (!file) {
          // Create the file first
          const result = fileSystemService.touch(fileName);
          if (!result.success) {
            return `nano: cannot create file '${fileName}'`;
          }
        }
        // Emit event to open nano editor with file ID if available
        const existingFile = items.find(item => item.name === fileName && item.type !== 'folder');
        if (existingFile) {
          windowEvents.emit('open-nano', { name: fileName, id: existingFile.id });
        } else {
          windowEvents.emit('open-nano', fileName);
        }
        return `Opening nano editor for: ${fileName}`;
      },
    },
    {
      name: 'tree',
      description: 'Display directory tree',
      execute: () => {
        const buildTree = (indent: string, parentId: string): string => {
          // Navigate to folder and get items
          const currentBackup = fileSystemService.getCurrentFolderId();
          fileSystemService.navigateToFolder(parentId);
          const items = fileSystemService.lsDirect();
          fileSystemService.navigateToFolder(currentBackup); // Restore
          
          let result = '';
          
          items.forEach((item, index) => {
            const isLast = index === items.length - 1;
            const connector = isLast ? '└── ' : '├── ';
            const nextIndent = indent + (isLast ? '    ' : '│   ');
            
            if (item.type === 'folder') {
              result += `${indent}${connector}\x1b[34m${item.name}\x1b[0m\n`;
              result += buildTree(nextIndent, item.id);
            } else {
              result += `${indent}${connector}${item.name}\n`;
            }
          });
          
          return result;
        };
        
        return buildTree('', fileSystemService.getCurrentFolderId());
      },
    },
    {
      name: 'find',
      description: 'Search for files',
      execute: (args) => {
        const name = args[0] || '*';
        const results: string[] = [];
        
        const searchInFolder = (folderId: string): void => {
          const currentBackup = fileSystemService.getCurrentFolderId();
          fileSystemService.navigateToFolder(folderId);
          const items = fileSystemService.lsDirect();
          fileSystemService.navigateToFolder(currentBackup); // Restore
          
          items.forEach(item => {
            const matches = name === '*' || item.name.includes(name.replace('*', ''));
            if (matches) {
              results.push(fileSystemService.getPath(item.id));
            }
            if (item.type === 'folder') {
              searchInFolder(item.id);
            }
          });
        };
        
        searchInFolder(fileSystemService.getCurrentFolderId());
        return results.join('\n') || 'No matches found';
      },
    },
  ];

  execute(input: string): TerminalLine[] {
    const lines: TerminalLine[] = [];
    
    // Add input to history
    if (input.trim()) {
      this.history.push(input);
      this.historyIndex = this.history.length;
    }

    // Parse command and arguments
    const parts = input.trim().split(/\s+/);
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Find command
    const command = this.commands.find(cmd => cmd.name === commandName);

    if (!command) {
      if (commandName) {
        lines.push({ type: 'input', content: input });
        lines.push({ type: 'error', content: `Command not found: ${commandName}` });
      }
      return lines;
    }

    // Execute command
    // Note: We don't add the input line here anymore - it's added in the Terminal component
    // with the correct path at that time
    
    let output = '';
    let shouldClear = false;
    
    try {
      const cmdOutput = command.execute(args, fileSystemService);
      
      if (cmdOutput === '__CLEAR__') {
        shouldClear = true;
      } else {
        output = cmdOutput;
      }
      
      if (shouldClear) {
        return []; // Special signal to clear - return empty array with special marker
      }
      
      // Add output if it exists, including empty strings (for ls on folders)
      if (output !== undefined) {
        lines.push({ type: 'output', content: output });
      }
    } catch (error) {
      lines.push({ type: 'error', content: `Error: ${error}` });
    }

    return lines;
  }

  getCommands(): TerminalCommand[] {
    return this.commands;
  }

  getHistory(): string[] {
    return this.history;
  }

  getPreviousCommand(): string {
    if (this.history.length === 0) return '';
    if (this.historyIndex > 0) {
      this.historyIndex--;
    }
    return this.history[this.historyIndex] || '';
  }

  getNextCommand(): string {
    if (this.history.length === 0) return '';
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      return this.history[this.historyIndex];
    }
    this.historyIndex = this.history.length;
    return '';
  }

  getAutocomplete(input: string): string[] {
    if (!input) return [];
    
    const parts = input.split(/\s+/);
    const lastPart = parts[parts.length - 1];
    
    // Check if it's a command
    if (parts.length === 1) {
      return this.commands
        .map(cmd => cmd.name)
        .filter(cmd => cmd.startsWith(lastPart));
    }
    
    // Otherwise autocomplete file/folder names
    const items = fileSystemService.lsDirect();
    return items
      .map(item => item.name)
      .filter(name => name.startsWith(lastPart));
  }
}

export const terminalService = new TerminalService();
