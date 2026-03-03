import type { 
  FileSystemItem, 
  FileNode, 
  FolderNode, 
  FileType, 
  OperationResult,
  PathResult 
} from './types';

// Simple UUID generator (since we don't have uuid package)
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export class FileSystemService {
  private items: Map<string, FileSystemItem> = new Map();
  private currentFolderId: string = '';
  private rootId: string = '';
  private listeners: Set<() => void> = new Set();
  private currentPath: string = '/root/home/user/Desktop'; // Default path

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // Create root directory
    this.rootId = generateId();
    const root: FolderNode = {
      id: this.rootId,
      name: 'root',
      type: 'folder',
      parentId: null,
      children: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.items.set(this.rootId, root);

    // Create home directory
    const homeId = generateId();
    const home: FolderNode = {
      id: homeId,
      name: 'home',
      type: 'folder',
      parentId: this.rootId,
      children: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.items.set(homeId, home);
    root.children.push(homeId);

    // Create user directory
    const userId = generateId();
    const user: FolderNode = {
      id: userId,
      name: 'user',
      type: 'folder',
      parentId: homeId,
      children: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.items.set(userId, user);
    home.children.push(userId);

    // Create desktop directory
    const desktopId = generateId();
    const desktop: FolderNode = {
      id: desktopId,
      name: 'Desktop',
      type: 'folder',
      parentId: userId,
      children: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.items.set(desktopId, desktop);
    user.children.push(desktopId);

    // Only add sample files if no saved state exists
    // The sample files are added here for first-time initialization
    // Create some sample files in Desktop
    const sampleFile1Id = generateId();
    const sampleFile1: FileNode = {
      id: sampleFile1Id,
      name: 'readme.txt',
      type: 'text',
      parentId: desktopId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      content: 'Welcome to my portfolio terminal!',
      extension: 'txt',
    };
    this.items.set(sampleFile1Id, sampleFile1);
    desktop.children.push(sampleFile1Id);

    const sampleFile2Id = generateId();
    const sampleFile2: FileNode = {
      id: sampleFile2Id,
      name: 'notes.json',
      type: 'json',
      parentId: desktopId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      content: '{"notes": "portfolio projects"}',
      extension: 'json',
    };
    this.items.set(sampleFile2Id, sampleFile2);
    desktop.children.push(sampleFile2Id);

    const sampleFolderId = generateId();
    const sampleFolder: FolderNode = {
      id: sampleFolderId,
      name: 'projects',
      type: 'folder',
      parentId: desktopId,
      children: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.items.set(sampleFolderId, sampleFolder);
    desktop.children.push(sampleFolderId);

    // Create a file inside projects folder
    const projectFileId = generateId();
    const projectFile: FileNode = {
      id: projectFileId,
      name: 'portfolio.md',
      type: 'text',
      parentId: sampleFolderId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      content: '# Portfolio\n\nMy projects and work.',
      extension: 'md',
    };
    this.items.set(projectFileId, projectFile);
    sampleFolder.children.push(projectFileId);

    // Create curriculum file on Desktop
    const curriculumFileId = generateId();
    const curriculumFile: FileNode = {
      id: curriculumFileId,
      name: 'curriculum.txt',
      type: 'text',
      parentId: desktopId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      readOnly: true,
      content: [
        '============================================',
        '          ISAAC MORA\'S CODEX',
        '============================================',
        '',
        'Frontend Web Developer with knowledge in backend and DevOps',
        'Creating unique and functional web experiences',
        '',
        '--- ABOUT ME ---',
        'I am a web developer passionate about creating innovative solutions.',
        'With experience in frontend, backend, and DevOps, I enjoy facing',
        'challenges and learning new technologies to improve my skills.',
        '',
        '--- EXPERIENCE ---',
        'Junior Web Developer',
        'Datawavelabs - 2023 - Present',
        '  - Development of reusable and scalable front-end components',
        '  - Design and development of RESTful back-ends using Django',
        '  - Integration of external APIs',
        '  - Creation of CI/CD pipelines with GitHub Actions',
        '  - Data analysis and creation of visualizations',
        '',
        '--- TECHNOLOGIES ---',
        'React, TypeScript, JavaScript, Python, Django, Docker,',
        'GitHub Actions, Tailwind CSS, Node.js, Vite',
        '',
        '--- CONTACT ---',
        'Email: Isaacmora12@gmail.com',
        'GitHub: https://github.com/IsaacMora12',
        '============================================',
      ].join('\n'),
      extension: 'txt',
    };
    this.items.set(curriculumFileId, curriculumFile);
    desktop.children.push(curriculumFileId);

    // Set current folder to desktop
    this.currentFolderId = desktopId;
    this.currentPath = '/root/home/user/Desktop';
  }

  // Subscribe to changes
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(listener => listener());
  }

  // Get current state
  getState(): { items: Record<string, FileSystemItem>; currentFolderId: string; rootId: string } {
    const itemsRecord: Record<string, FileSystemItem> = {};
    this.items.forEach((value, key) => {
      itemsRecord[key] = value;
    });
    return {
      items: itemsRecord,
      currentFolderId: this.currentFolderId,
      rootId: this.rootId,
    };
  }

  // Load state from IndexedDB
  loadState(state: { items: Record<string, FileSystemItem>; currentFolderId: string; rootId: string }): void {
    this.items = new Map(Object.entries(state.items));
    this.currentFolderId = state.currentFolderId;
    this.rootId = state.rootId;
    this.notify();
  }

  // Get current folder ID
  getCurrentFolderId(): string {
    return this.currentFolderId;
  }

  // Get path from root to a node
  getPath(nodeId: string): string {
    const parts: string[] = [];
    let currentId: string | null = nodeId;
    
    while (currentId) {
      const node = this.items.get(currentId);
      if (!node) break;
      parts.unshift(node.name);
      currentId = node.parentId;
    }
    
    return '/' + parts.join('/');
  }

  // Resolve path to node ID
  resolvePath(path: string): PathResult {
    if (path === '/' || path === '~') {
      return { nodeId: this.rootId, path: '/' };
    }

    // Handle absolute paths
    let currentId = path.startsWith('/') ? this.rootId : this.currentFolderId;
    
    // Handle ~ prefix
    if (path.startsWith('~')) {
      currentId = this.rootId;
      path = path.slice(1);
    }

    // Handle .. and .
    let parts = path.split('/').filter(p => p && p !== '.');

    // If first part matches root folder name, skip it (path starts from root anyway)
    const rootNode = this.items.get(this.rootId);
    if (rootNode && parts[0] === rootNode.name) {
      parts = parts.slice(1);
    }
    
    for (const part of parts) {
      if (part === '..') {
        const current = this.items.get(currentId);
        if (current?.parentId) {
          currentId = current.parentId;
        }
      } else {
        const current = this.items.get(currentId);
        if (current && current.type === 'folder') {
          const childId = (current as FolderNode).children.find(id => {
            const child = this.items.get(id);
            return child?.name === part;
          });
          if (childId) {
            currentId = childId;
          } else {
            return { nodeId: null, path: this.getPath(currentId) };
          }
        }
      }
    }

    return { nodeId: currentId, path: this.getPath(currentId) };
  }

  // List contents of current folder directly (bypasses path resolution)
  lsDirect(): FileSystemItem[] {
    const folder = this.items.get(this.currentFolderId);
    if (!folder || folder.type !== 'folder') {
      return [];
    }
    const folderNode = folder as FolderNode;
    return folderNode.children
      .map(id => this.items.get(id))
      .filter((item): item is FileSystemItem => item !== undefined);
  }

  // Get folders in current directory (for desktop icons)
  getFoldersInCurrentDir(): Array<{ id: string; name: string }> {
    const items = this.lsDirect();
    return items
      .filter(item => item.type === 'folder')
      .map(folder => ({ id: folder.id, name: folder.name }));
  }

  // Get all items (files AND folders) for desktop display with full metadata
  getItemsForDesktop(): Array<{ id: string; name: string; type: 'folder' | 'file'; extension?: string }> {
    const items = this.lsDirect();
    return items.map(item => ({
      id: item.id,
      name: item.name,
      type: item.type === 'folder' ? 'folder' : 'file',
      extension: item.type !== 'folder' ? (item as import('./types').FileNode).extension : undefined,
    }));
  }



  // Generate tree representation of a folder
  tree(path?: string, prefix: string = '', isRoot: boolean = true): string {
    const targetPath = path || this.getPath(this.currentFolderId);
    const { nodeId } = this.resolvePath(targetPath);
    
    if (!nodeId) return '';
    
    const node = this.items.get(nodeId);
    if (!node) return '';
    
    let result = '';
    
    // For root, just show name without prefix
    if (isRoot) {
      result = `${node.name}{\n`;
    }
    
    if (node.type === 'folder') {
      const folder = node as FolderNode;
      const children = folder.children
        .map(id => this.items.get(id))
        .filter((item): item is FileSystemItem => item !== undefined)
        .sort((a, b) => {
          // Folders first, then by name
          if (a.type === 'folder' && b.type !== 'folder') return -1;
          if (a.type !== 'folder' && b.type === 'folder') return 1;
          return a.name.localeCompare(b.name);
        });
      
      children.forEach((child) => {
        
        if (child.type === 'folder') {
          result += `${prefix}${child.name}{\n`;
          result += this.tree(
            this.getPath(child.id),
            prefix + '  ',
            false
          );
        } else {
          // File - show with name and content preview
          result += `${prefix}${child.name}`;
          // Add content preview for text files
          if ((child as FileNode).content) {
            const fileNode = child as FileNode;
            const preview = fileNode.content.length > 20 
                ? fileNode.content.substring(0, 20) + '...'
                : fileNode.content;
            result += ` .(${preview})`;
          }
          result += '\n';
        }
      });
      
      if (isRoot) {
        result += '}';
      }
    }
    
    return result;
  }

  // Change current directory
  cd(path: string): OperationResult {
    const { nodeId } = this.resolvePath(path);
    
    if (!nodeId) {
      return { success: false, message: `cd: no such directory: ${path}` };
    }
    
    const node = this.items.get(nodeId);
    if (!node || node.type !== 'folder') {
      return { success: false, message: `cd: not a directory: ${path}` };
    }
    
    this.currentFolderId = nodeId;
    this.currentPath = this.getPath(nodeId); // Update current path
    this.notify();
    return { success: true, message: this.currentPath };
  }

  // Get current working directory - returns path based on current folder
  pwd(): string {
    // Return the stored current path directly
    return this.currentPath || '/';
  }

  // Set current path
  setCurrentPath(path: string): void {
    this.currentPath = path;
  }

  // Navigate to a folder by ID (used by desktop to open folders in explorer)
  navigateToFolder(folderId: string): boolean {
    const node = this.items.get(folderId);
    if (!node || node.type !== 'folder') {
      return false;
    }
    this.currentFolderId = folderId;
    this.currentPath = this.getPath(folderId);
    this.notify();
    return true;
  }

  // Get path as array of folder names
  getPathArray(): string[] {
    const fullPath = this.getPath(this.currentFolderId);
    return fullPath.split('/').filter(p => p);
  }

  // Get items from a specific path (for FileExplorer navigation)
  getItemsFromPath(path: string[]): Array<{ id: string; name: string; type: 'folder' | 'file'; extension?: string }> {
    // Start from root
    let currentId = this.rootId;
    
    // Skip the first segment if it matches the root folder name (e.g. 'root')
    // since we already start at rootId
    const rootNode = this.items.get(this.rootId);
    const segments = (rootNode && path.length > 0 && path[0] === rootNode.name)
      ? path.slice(1)
      : path;
    
    // Navigate to the target folder
    for (const part of segments) {
      const current = this.items.get(currentId);
      if (!current || current.type !== 'folder') return [];
      
      const childId = (current as FolderNode).children.find(id => {
        const child = this.items.get(id);
        return child?.name === part;
      });
      
      if (!childId) return [];
      currentId = childId;
    }
    
    // Get items from the target folder
    const folder = this.items.get(currentId);
    if (!folder || folder.type !== 'folder') return [];
    
    const folderNode = folder as FolderNode;
    const result: Array<{ id: string; name: string; type: 'folder' | 'file'; extension?: string }> = [];
    
    for (const id of folderNode.children) {
      const item = this.items.get(id);
      if (!item) continue;
      
      if (item.type === 'folder') {
        result.push({
          id: item.id,
          name: item.name,
          type: 'folder' as const,
        });
      } else {
        result.push({
          id: item.id,
          name: item.name,
          type: 'file' as const,
          extension: (item as FileNode).extension,
        });
      }
    }
    
    return result;
  }

  // Get file by ID
  getFileById(fileId: string): FileNode | null {
    const item = this.items.get(fileId);
    if (item && item.type !== 'folder') {
      return item as FileNode;
    }
    return null;
  }

  // Get Desktop folder ID
  getDesktopFolderId(): string {
    // Navigate from root to find Desktop folder
    const root = this.items.get(this.rootId);
    if (!root || root.type !== 'folder') return this.rootId;
    
    const home = this.items.get((root as FolderNode).children[0]);
    if (!home || home.type !== 'folder') return this.rootId;
    
    const user = this.items.get((home as FolderNode).children[0]);
    if (!user || user.type !== 'folder') return this.rootId;
    
    const desktop = this.items.get((user as FolderNode).children[0]);
    if (!desktop || desktop.type !== 'folder') return this.rootId;
    
    return desktop.id;
  }

  // Get items from Desktop folder (for desktop display)
  getDesktopItems(): Array<{ id: string; name: string; type: 'folder' | 'file'; extension?: string }> {
    const desktopId = this.getDesktopFolderId();
    const desktop = this.items.get(desktopId);
    if (!desktop || desktop.type !== 'folder') return [];
    
    const folderNode = desktop as FolderNode;
    const result: Array<{ id: string; name: string; type: 'folder' | 'file'; extension?: string }> = [];
    
    for (const id of folderNode.children) {
      const item = this.items.get(id);
      if (!item) continue;
      
      if (item.type === 'folder') {
        result.push({
          id: item.id,
          name: item.name,
          type: 'folder' as const,
        });
      } else {
        result.push({
          id: item.id,
          name: item.name,
          type: 'file' as const,
          extension: (item as FileNode).extension,
        });
      }
    }
    
    return result;
  }

  // Create a new folder
  mkdir(name: string): OperationResult {
    const parent = this.items.get(this.currentFolderId) as FolderNode;
    if (!parent || parent.type !== 'folder') {
      return { success: false, message: 'mkdir: current directory is invalid' };
    }

    // Check if folder already exists
    const exists = parent.children.some(id => {
      const child = this.items.get(id);
      return child?.name === name;
    });

    if (exists) {
      return { success: false, message: `mkdir: cannot create directory '${name}': File exists` };
    }

    const id = generateId();
    const folder: FolderNode = {
      id,
      name,
      type: 'folder',
      parentId: this.currentFolderId,
      children: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.items.set(id, folder);
    parent.children.push(id);
    this.notify();
    
    return { success: true, message: '', data: { id, name, type: 'folder' } };
  }

  // Create a new file
  touch(name: string, content: string = '', type: FileType = 'text'): OperationResult {
    const parent = this.items.get(this.currentFolderId) as FolderNode;
    if (!parent || parent.type !== 'folder') {
      return { success: false, message: 'touch: current directory is invalid' };
    }

    // Determine file type from extension
    let fileType: FileType = type;
    let extension = '';
    
    if (name.includes('.')) {
      const ext = name.split('.').pop()?.toLowerCase();
      extension = ext || '';
      if (ext === 'json') fileType = 'json';
      else if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext || '')) fileType = 'image';
      else fileType = 'text';
    }

    // Check if file already exists
    const exists = parent.children.some(id => {
      const child = this.items.get(id);
      return child?.name === name;
    });

    if (exists) {
      // Just update timestamp
      const existingId = parent.children.find(id => {
        const child = this.items.get(id);
        return child?.name === name;
      });
      if (existingId) {
        const existing = this.items.get(existingId);
        if (existing) {
          existing.updatedAt = Date.now();
          this.notify();
        }
      }
      return { success: true, message: '' };
    }

    const id = generateId();
    const file: FileNode = {
      id,
      name,
      type: fileType as 'text' | 'json' | 'image',
      parentId: this.currentFolderId,
      content,
      extension,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.items.set(id, file);
    parent.children.push(id);
    this.notify();
    
    return { success: true, message: '', data: { id, name, type: fileType } };
  }

  // Read file content
  cat(path: string): OperationResult {
    const { nodeId } = this.resolvePath(path);
    
    if (!nodeId) {
      return { success: false, message: `cat: ${path}: No such file or directory` };
    }
    
    const node = this.items.get(nodeId);
    if (!node) {
      return { success: false, message: `cat: ${path}: No such file or directory` };
    }
    
    if (node.type === 'folder') {
      return { success: false, message: `cat: ${path}: Is a directory` };
    }
    
    const file = node as FileNode;
    return { success: true, message: file.content, data: { content: file.content, name: file.name } };
  }

  // Write content to file
  write(path: string, content: string): OperationResult {
    const { nodeId } = this.resolvePath(path);
    
    if (!nodeId) {
      return { success: false, message: `write: ${path}: No such file or directory` };
    }
    
    const node = this.items.get(nodeId);
    if (!node || node.type === 'folder') {
      return { success: false, message: `write: ${path}: Is a directory or invalid` };
    }
    
    const file = node as FileNode;
    if (file.readOnly) {
      return { success: false, message: `write: ${path}: Read-only file` };
    }
    file.content = content;
    file.updatedAt = Date.now();
    this.notify();
    
    return { success: true, message: 'File written successfully' };
  }

  // Write content to file by name (direct - bypasses path resolution)
  writeFile(name: string, content: string): OperationResult {
    const parent = this.items.get(this.currentFolderId) as FolderNode;
    if (!parent || parent.type !== 'folder') {
      return { success: false, message: 'writeFile: current directory is invalid' };
    }
    
    // Find the file in current folder
    const fileId = parent.children.find(id => {
      const child = this.items.get(id);
      return child?.name === name && child.type !== 'folder';
    });
    
    if (!fileId) {
      return { success: false, message: `writeFile: ${name}: No such file` };
    }
    
    const node = this.items.get(fileId);
    if (!node || node.type === 'folder') {
      return { success: false, message: `writeFile: ${name}: Is a directory` };
    }
    
    const file = node as FileNode;
    if (file.readOnly) {
      return { success: false, message: `writeFile: ${name}: Read-only file` };
    }
    file.content = content;
    file.updatedAt = Date.now();
    this.notify();
    
    return { success: true, message: 'File written successfully' };
  }

  // Check if a file is read-only by name in current directory
  isFileReadOnly(name: string): boolean {
    const parent = this.items.get(this.currentFolderId) as FolderNode;
    if (!parent || parent.type !== 'folder') return false;
    const fileId = parent.children.find(id => {
      const child = this.items.get(id);
      return child?.name === name && child.type !== 'folder';
    });
    if (!fileId) return false;
    const node = this.items.get(fileId);
    if (!node || node.type === 'folder') return false;
    return (node as FileNode).readOnly === true;
  }

  // Remove file or folder
  rm(path: string, recursive: boolean = false): OperationResult {
    const { nodeId } = this.resolvePath(path);
    
    if (!nodeId) {
      return { success: false, message: `rm: ${path}: No such file or directory` };
    }

    if (nodeId === this.rootId || nodeId === this.currentFolderId) {
      return { success: false, message: `rm: cannot remove '${path}': Permission denied` };
    }
    
    const node = this.items.get(nodeId);
    if (!node) {
      return { success: false, message: `rm: ${path}: No such file or directory` };
    }

    // If folder and not recursive, check if empty
    if (node.type === 'folder' && !recursive) {
      const folder = node as FolderNode;
      if (folder.children.length > 0) {
        return { success: false, message: `rm: ${path}: Directory not empty` };
      }
    }

    // If folder, remove all children recursively
    if (node.type === 'folder') {
      const folder = node as FolderNode;
      const removeRecursive = (id: string) => {
        const item = this.items.get(id);
        if (item?.type === 'folder') {
          (item as FolderNode).children.forEach(childId => removeRecursive(childId));
        }
        this.items.delete(id);
      };
      folder.children.forEach(childId => removeRecursive(childId));
    }

    // Remove from parent
    if (node.parentId) {
      const parent = this.items.get(node.parentId) as FolderNode;
      if (parent) {
        parent.children = parent.children.filter(id => id !== nodeId);
        parent.updatedAt = Date.now();
      }
    }

    this.items.delete(nodeId);
    this.notify();
    
    return { success: true, message: '' };
  }

  // Copy file or folder
  cp(source: string, destination: string): OperationResult {
    const { nodeId: sourceId } = this.resolvePath(source);
    
    if (!sourceId) {
      return { success: false, message: `cp: ${source}: No such file or directory` };
    }

    const sourceNode = this.items.get(sourceId);
    if (!sourceNode) {
      return { success: false, message: `cp: ${source}: No such file or directory` };
    }

    // Parse destination
    let destName = destination;
    let destParentId = this.currentFolderId;
    
    if (destination.includes('/')) {
      const lastSlash = destination.lastIndexOf('/');
      const destPath = destination.slice(0, lastSlash);
      destName = destination.slice(lastSlash + 1);
      
      if (destPath) {
        const { nodeId } = this.resolvePath(destPath);
        if (nodeId) {
          destParentId = nodeId;
        }
      }
    }

    // Create copy
    const copyRecursive = (originalId: string, newParentId: string, newName: string): string => {
      const original = this.items.get(originalId);
      if (!original) return '';
      
      const newId = generateId();
      
      if (original.type === 'folder') {
        const originalFolder = original as FolderNode;
        const newFolder: FolderNode = {
          ...originalFolder,
          id: newId,
          name: newName,
          parentId: newParentId,
          children: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        this.items.set(newId, newFolder);
        
        // Copy children
        originalFolder.children.forEach(childId => {
          const childNewId = copyRecursive(childId, newId, this.items.get(childId)?.name || 'file');
          if (childNewId) {
            newFolder.children.push(childNewId);
          }
        });
      } else {
        const originalFile = original as FileNode;
        const newFile: FileNode = {
          ...originalFile,
          id: newId,
          name: newName,
          parentId: newParentId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        this.items.set(newId, newFile);
      }

      // Add to parent
      const parent = this.items.get(newParentId);
      if (parent?.type === 'folder') {
        (parent as FolderNode).children.push(newId);
      }

      return newId;
    };

    copyRecursive(sourceId, destParentId, destName);
    this.notify();
    
    return { success: true, message: '' };
  }

  // Move/rename file or folder
  mv(source: string, destination: string): OperationResult {
    const { nodeId: sourceId } = this.resolvePath(source);
    
    if (!sourceId) {
      return { success: false, message: `mv: ${source}: No such file or directory` };
    }

    const sourceNode = this.items.get(sourceId);
    if (!sourceNode) {
      return { success: false, message: `mv: ${source}: No such file or directory` };
    }

    // Prevent moving into self
    if (destination.startsWith(source) || destination.startsWith(this.getPath(sourceId))) {
      return { success: false, message: `mv: cannot move '${source}' into itself` };
    }

    // Parse destination
    let destName = destination;
    let destParentId = this.currentFolderId;
    
    if (destination.includes('/')) {
      const lastSlash = destination.lastIndexOf('/');
      const destPath = destination.slice(0, lastSlash);
      destName = destination.slice(lastSlash + 1);
      
      if (destPath) {
        const { nodeId } = this.resolvePath(destPath);
        if (nodeId) {
          destParentId = nodeId;
        }
      }
    }

    // Remove from old parent
    if (sourceNode.parentId) {
      const oldParent = this.items.get(sourceNode.parentId) as FolderNode;
      if (oldParent) {
        oldParent.children = oldParent.children.filter(id => id !== sourceId);
      }
    }

    // Add to new parent
    const newParent = this.items.get(destParentId) as FolderNode;
    if (newParent) {
      newParent.children.push(sourceId);
      newParent.updatedAt = Date.now();
    }

    // Update node
    sourceNode.name = destName;
    sourceNode.parentId = destParentId;
    sourceNode.updatedAt = Date.now();
    
    this.notify();
    
    return { success: true, message: '' };
  }

  // Move item to folder by ID (for drag and drop)
  moveToFolder(itemId: string, targetFolderId: string): OperationResult {
    const item = this.items.get(itemId);
    if (!item) {
      return { success: false, message: 'Item not found' };
    }
    
    const targetFolder = this.items.get(targetFolderId);
    if (!targetFolder || targetFolder.type !== 'folder') {
      return { success: false, message: 'Target folder not found' };
    }
    
    // Prevent moving into self
    if (itemId === targetFolderId) {
      return { success: false, message: 'Cannot move item into itself' };
    }
    
    // Remove from current parent
    if (item.parentId) {
      const parent = this.items.get(item.parentId);
      if (parent && parent.type === 'folder') {
        (parent as FolderNode).children = parent.children.filter(id => id !== itemId);
      }
    }
    
    // Add to target folder
    (targetFolder as FolderNode).children.push(itemId);
    item.parentId = targetFolderId;
    item.updatedAt = Date.now();
    
    this.notify();
    return { success: true, message: '' };
  }

  // Navigate to parent folder
  navigateToParent(): boolean {
    const currentFolder = this.items.get(this.currentFolderId);
    if (!currentFolder || !currentFolder.parentId) {
      return false;
    }
    
    this.currentFolderId = currentFolder.parentId;
    this.currentPath = this.getPath(this.currentFolderId);
    this.notify();
    return true;
  }

  // Get all folders for navigation
  getAllFolders(): Array<{ id: string; path: string; name: string }> {
    const folders: Array<{ id: string; path: string; name: string }> = [];
    
    this.items.forEach((item, id) => {
      if (item.type === 'folder') {
        folders.push({
          id,
          path: this.getPath(id),
          name: item.name,
        });
      }
    });
    
    return folders;
  }



  // Check if path exists
  exists(path: string): boolean {
    const { nodeId } = this.resolvePath(path);
    return nodeId !== null;
  }
}

// Export singleton instance
export const fileSystemService = new FileSystemService();
