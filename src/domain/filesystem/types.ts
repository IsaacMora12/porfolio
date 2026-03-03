// Tipos del Sistema de Archivos Virtual

export type FileType = 'folder' | 'text' | 'json' | 'image';

export interface FileSystemNode {
  id: string;
  name: string;
  type: FileType;
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface FileNode extends FileSystemNode {
  type: 'text' | 'json' | 'image';
  content: string;
  extension: string;
  readOnly?: boolean;
}

export interface FolderNode extends FileSystemNode {
  type: 'folder';
  children: string[];
}

export type FileSystemItem = FileNode | FolderNode;

export interface FileSystemState {
  rootId: string;
  currentFolderId: string;
  items: Record<string, FileSystemItem>;
}

export interface PathResult {
  nodeId: string | null;
  path: string;
}

// Forward declaration - implemented in FileSystemService
export type FileSystemServiceType = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

// Comando de terminal
export interface TerminalCommand {
  name: string;
  description: string;
  execute: (args: string[], fs: FileSystemServiceType) => string;
}

// Resultado de operación
export interface OperationResult {
  success: boolean;
  message: string;
  data?: unknown;
}
