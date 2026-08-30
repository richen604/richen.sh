import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { store } from '../store';

export type FileSystemNode = {
  type: 'file' | 'directory';
  content?: string | Uint8Array;
  children?: Record<string, FileSystemNode>;
  mimetype?: string;
};

export type FileSystem = {
  root: FileSystemNode;
  cwd: string[];
};

const initialFileSystem: FileSystem = {
  root: {
    type: 'directory',
    children: {
      home: {
        type: 'directory',
        children: {
          user: {
            type: 'directory',
            children: {
              'welcome.txt': {
                type: 'file',
                content: 'Welcome to the filesystem!',
                mimetype: 'text/plain',
              },
            },
          },
        },
      },
    },
  },
  cwd: ['home', 'user'],
};

const normalizeBytes = (value: unknown): Uint8Array | null => {
  if (value instanceof Uint8Array) return new Uint8Array(value);
  if (typeof value !== 'object' || value === null) return null;
  const record = value as Record<string, unknown>;
  const source = record.type === 'Buffer' && Array.isArray(record.data)
    ? record.data
    : Object.keys(record).every((key) => /^\d+$/.test(key))
      ? Object.keys(record).sort((a, b) => Number(a) - Number(b)).map((key) => record[key])
      : null;
  if (source?.every((byte) => typeof byte === 'number' && Number.isInteger(byte) && byte >= 0 && byte <= 255) !== true) {
    return null;
  }
  return Uint8Array.from(source as number[]);
};

const normalizeNode = (value: unknown): FileSystemNode | null => {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (record.type === 'file') {
    const bytes = normalizeBytes(record.content);
    if (record.content !== undefined && typeof record.content !== 'string' && !bytes) return null;
    return {
      type: 'file',
      content: typeof record.content === 'string' ? record.content : bytes ?? undefined,
      ...(typeof record.mimetype === 'string' ? { mimetype: record.mimetype } : {}),
    };
  }
  if (record.type !== 'directory') return null;
  const children: Record<string, FileSystemNode> = {};
  if (typeof record.children === 'object' && record.children !== null && !Array.isArray(record.children)) {
    for (const [name, child] of Object.entries(record.children)) {
      if (!name || name === '.' || name === '..' || name.includes('/')) continue;
      const normalized = normalizeNode(child);
      if (normalized) children[name] = normalized;
    }
  }
  return { type: 'directory', children };
};

const normalizeFileSystem = (value: unknown): FileSystem => {
  if (!value || typeof value !== 'object') return initialFileSystem;
  const record = value as Record<string, unknown>;
  const root = normalizeNode(record.root);
  if (!root || root.type !== 'directory') return initialFileSystem;
  const cwd = Array.isArray(record.cwd)
    ? record.cwd.filter((segment): segment is string => typeof segment === 'string' && !!segment && segment !== '.' && segment !== '..' && !segment.includes('/'))
    : [];
  const fs = { root, cwd };
  return getNodeAtPath(fs, cwd)?.type === 'directory' ? fs : { root, cwd: [] };
};

const fileSystemStorage: {
  getItem: (key: string, initialValue: FileSystem) => FileSystem;
  setItem: (key: string, value: FileSystem) => void;
  removeItem: (key: string) => void;
} = (() => {
  const storage = createJSONStorage<unknown>(() => localStorage);
  return {
    getItem(key, initialValue) {
      try {
        return normalizeFileSystem(storage.getItem(key, initialValue));
      } catch {
        return initialValue;
      }
    },
    setItem: (key, value) => storage.setItem(key, value),
    removeItem: (key) => storage.removeItem(key),
  };
})();

export const fileSystemAtom = atomWithStorage<FileSystem>('filesystem', initialFileSystem, fileSystemStorage, { getOnInit: true });

const getMimetype = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'txt': return 'text/plain';
    case 'json': return 'application/json';
    case 'js': return 'application/javascript';
    case 'ts': return 'application/typescript';
    case 'html': return 'text/html';
    case 'css': return 'text/css';
    case 'png': return 'image/png';
    case 'jpg': return 'image/jpeg';
    case 'jpeg': return 'image/jpeg';
    case 'gif': return 'image/gif';
    case 'pdf': return 'application/pdf';
    default: return 'application/octet-stream';
  }
};

const getFileEmoji = (mimetype: string): string => {
  if (mimetype.startsWith('text/')) return '📄';
  if (mimetype.startsWith('image/')) return '🖼️';
  if (mimetype.includes('javascript') || mimetype.includes('typescript')) return '📜';
  if (mimetype === 'application/json') return '📊';
  if (mimetype === 'application/pdf') return '📑';
  return '📁';
};

const getNodeAtPath = (fs: FileSystem, path: string[]): FileSystemNode | null => {
  let current = fs.root;
  for (const segment of path) {
    if (current.type !== 'directory' || !current.children?.[segment]) {
      return null;
    }
    current = current.children[segment];
  }
  return current;
};

const resolvePath = (fs: FileSystem, path: string): string[] => {
  const segments = path.split('/').filter(Boolean);
  const resolvedPath = path.startsWith('/') ? [] : [...fs.cwd];

  for (const segment of segments) {
    if (segment === '..') {
      if (resolvedPath.length > 0) {
        resolvedPath.pop();
      }
    } else if (segment !== '.') {
      resolvedPath.push(segment);
    }
  }

  return resolvedPath;
};

const updateFileSystem = (fs: FileSystem, updater: (draft: FileSystem) => void): FileSystem => {
  const newFs = structuredClone(fs);
  updater(newFs);
  store.set(fileSystemAtom, newFs);
  return newFs;
};

export const uint8ArrayToBase64 = (uint8Array: Uint8Array): string => {
  return btoa(Array.from(uint8Array, (byte) => String.fromCharCode(byte)).join(''));
};


export const base64ToUint8Array = (base64: string): Uint8Array => {
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
};

const uint8ArrayToBlob = (uint8Array: Uint8Array, mimeType: string): Blob => {
  return new Blob([uint8Array], { type: mimeType });
};

export const blobToUint8Array = async (blob: Blob): Promise<Uint8Array> => {
  const arrayBuffer = await blob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
};

export const getFileAsBlob = (fs: FileSystem, path: string): Blob => {
  const resolvedPath = resolvePath(fs, path);
  const node = getNodeAtPath(fs, resolvedPath);
  if (node && node.type === 'file' && node.content !== undefined) {
    const mimeType = node.mimetype ?? 'application/octet-stream';
    if (typeof node.content === 'string') {
      return new Blob([node.content], { type: mimeType });
    } else {
      return uint8ArrayToBlob(node.content, mimeType);
    }
  }
  throw new Error('File not found or is not readable');
};

// Filesystem commands
export const cd = (fs: FileSystem, path: string): FileSystem => {
  const resolvedPath = resolvePath(fs, path);

  const node = getNodeAtPath(fs, resolvedPath);
  if (node && node.type === 'directory') {
    return updateFileSystem(fs, (draft) => {
      draft.cwd = resolvedPath;
    });
  }
  throw new Error('Directory not found');
};

export const ls = (fs: FileSystem, path?: string): string => {
  const targetPath = path ? resolvePath(fs, path) : fs.cwd;
  const node = getNodeAtPath(fs, targetPath);
  if (node && node.type === 'directory') {
    const entries = Object.entries(node.children ?? {});
    if (entries.length === 0) return '';
    const maxNameLength = Math.max(...entries.map(([name]) => name.length));

    return entries.map(([name, childNode]) => {
      const emoji = childNode.type === 'directory' ? '📁' : getFileEmoji(childNode.mimetype ?? 'application/octet-stream');
      const paddedName = name.padEnd(maxNameLength + 2);
      return `${emoji} ${paddedName}`;
    }).join('\n');
  }
  throw new Error('Directory not found');
};

export const cat = (fs: FileSystem, path: string): string => {
  const resolvedPath = resolvePath(fs, path);
  const node = getNodeAtPath(fs, resolvedPath);
  if (node && node.type === 'file' && node.content !== undefined) {
    if (typeof node.content === 'string') return node.content;
    const bytes = normalizeBytes(node.content);
    if (!bytes) return '[binary file: unreadable legacy data]';
    if (node.mimetype?.startsWith('text/')) {
      return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    }
    return `[binary file: ${bytes.byteLength} bytes, ${node.mimetype ?? 'application/octet-stream'}]`;
  }
  throw new Error('File not found or is not readable');
};


export const mkdir = (fs: FileSystem, path: string): FileSystem => {
  const resolvedPath = resolvePath(fs, path);
  const parentPath = resolvedPath.slice(0, -1);
  const dirName = resolvedPath[resolvedPath.length - 1];
  const parentNode = getNodeAtPath(fs, parentPath);

  if (parentNode && parentNode.type === 'directory') {
    return updateFileSystem(fs, (draft) => {
      const draftParentNode = getNodeAtPath(draft, parentPath)!;
      draftParentNode.children ??= {};
      if (draftParentNode.children[dirName]) {
        throw new Error('Directory already exists');
      }
      draftParentNode.children[dirName] = { type: 'directory', children: {} };
    });
  }
  throw new Error('Parent directory not found');
};

// Updated touch function to include mimetype and handle binary data
export const touch = (fs: FileSystem, path: string, content?: string | Uint8Array): FileSystem => {
  const resolvedPath = resolvePath(fs, path);
  const parentPath = resolvedPath.slice(0, -1);
  const fileName = resolvedPath[resolvedPath.length - 1];
  const parentNode = getNodeAtPath(fs, parentPath);

  if (parentNode && parentNode.type === 'directory') {
    return updateFileSystem(fs, (draft) => {
      const draftParentNode = getNodeAtPath(draft, parentPath)!;
      draftParentNode.children ??= {};
      if (draftParentNode.children[fileName]) {
        throw new Error('File already exists');
      }
      draftParentNode.children[fileName] = {
        type: 'file',
        content: content ?? '',
        mimetype: getMimetype(fileName)
      };
    });
  }
  throw new Error('Parent directory not found');
};

export const rm = (fs: FileSystem, path: string): FileSystem => {
  const resolvedPath = resolvePath(fs, path);
  const parentPath = resolvedPath.slice(0, -1);
  const name = resolvedPath[resolvedPath.length - 1];
  const parentNode = getNodeAtPath(fs, parentPath);

  if (parentNode && parentNode.type === 'directory' && parentNode.children) {
    return updateFileSystem(fs, (draft) => {
      const draftParentNode = getNodeAtPath(draft, parentPath)!;
      if (!draftParentNode.children?.[name]) {
        throw new Error('File or directory not found');
      }
      delete draftParentNode.children[name];
    });
  }
  throw new Error('Parent directory not found');
};

export const mv = (fs: FileSystem, sourcePath: string, destPath: string): FileSystem => {
  const resolvedSourcePath = resolvePath(fs, sourcePath);
  const resolvedDestPath = resolvePath(fs, destPath);
  const sourceParentPath = resolvedSourcePath.slice(0, -1);
  const sourceName = resolvedSourcePath[resolvedSourcePath.length - 1];
  const destParentPath = resolvedDestPath.slice(0, -1);
  const destName = resolvedDestPath[resolvedDestPath.length - 1];

  const sourceParentNode = getNodeAtPath(fs, sourceParentPath);
  const destParentNode = getNodeAtPath(fs, destParentPath);

  if (sourceParentNode && sourceParentNode.type === 'directory' && sourceParentNode.children &&
    destParentNode && destParentNode.type === 'directory') {
    return updateFileSystem(fs, (draft) => {
      const draftSourceParentNode = getNodeAtPath(draft, sourceParentPath)!;
      const draftDestParentNode = getNodeAtPath(draft, destParentPath)!;

      if (!draftSourceParentNode.children?.[sourceName]) {
        throw new Error('Source file or directory not found');
      }
      draftDestParentNode.children ??= {};
      if (draftDestParentNode.children[destName]) {
        throw new Error('Destination already exists');
      }
      draftDestParentNode.children[destName] = draftSourceParentNode.children[sourceName];
      delete draftSourceParentNode.children[sourceName];
    });
  }
  throw new Error('Source or destination directory not found');
};

export const cp = (fs: FileSystem, sourcePath: string, destPath: string): FileSystem => {
  const resolvedSourcePath = resolvePath(fs, sourcePath);
  const resolvedDestPath = resolvePath(fs, destPath);
  const sourceNode = getNodeAtPath(fs, resolvedSourcePath);
  const destParentPath = resolvedDestPath.slice(0, -1);
  const destName = resolvedDestPath[resolvedDestPath.length - 1];
  const destParentNode = getNodeAtPath(fs, destParentPath);

  if (sourceNode && destParentNode && destParentNode.type === 'directory') {
    return updateFileSystem(fs, (draft) => {
      const draftSourceNode = getNodeAtPath(draft, resolvedSourcePath);
      const draftDestParentNode = getNodeAtPath(draft, destParentPath)!;

      draftDestParentNode.children ??= {};
      if (draftDestParentNode.children[destName]) {
        throw new Error('Destination already exists');
      }
      draftDestParentNode.children[destName] = structuredClone(draftSourceNode!);
    });
  }
  throw new Error('Source file/directory not found or destination directory not found');
};
