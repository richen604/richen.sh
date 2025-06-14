import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { store } from '../store';
import { Buffer } from 'buffer';

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

export const fileSystemAtom = atomWithStorage<FileSystem>('filesystem', initialFileSystem, createJSONStorage());

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
  const newFs = JSON.parse(JSON.stringify(fs)) as FileSystem;
  updater(newFs);
  store.set(fileSystemAtom, newFs);
  return newFs;
};

export const uint8ArrayToBase64 = (uint8Array: Uint8Array): string => {
  return Buffer.from(uint8Array).toString('base64');
};


export const base64ToUint8Array = (base64: string): Uint8Array => {
  return new Uint8Array(Buffer.from(base64, 'base64'));
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
  if (path === '/') {
    return updateFileSystem(fs, (draft) => {
      draft.cwd = [];
    });
  }
  const segments = path.split('/').filter(Boolean);
  const resolvedPath = [...fs.cwd];

  for (const segment of segments) {
    if (segment === '..') {
      if (resolvedPath.length > 0) {
        resolvedPath.pop();
      }
    } else if (segment !== '.') {
      resolvedPath.push(segment);
    }
  }

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
  if (node && node.type === 'directory' && node.children) {
    const entries = Object.entries(node.children);
    const maxNameLength = Math.max(...entries.map(([name]) => name.length));

    return entries.map(([name, childNode]) => {
      const emoji = childNode.type === 'directory' ? '📁' : getFileEmoji(childNode.mimetype ?? 'application/octet-stream');
      const paddedName = name.padEnd(maxNameLength + 2);
      return `${emoji} ${paddedName}`;
    }).join('\n');
  }
  throw new Error('Directory not found');
};

export const cat = (fs: FileSystem, path: string): string | Uint8Array => {
  const resolvedPath = resolvePath(fs, path);
  const node = getNodeAtPath(fs, resolvedPath);
  if (node && node.type === 'file' && node.content !== undefined) {
    return node.content;
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
      if (!draftParentNode.children) {
        draftParentNode.children = {};
      }
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
      if (!draftParentNode.children) {
        draftParentNode.children = {};
      }
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
      if (!draftDestParentNode.children) {
        draftDestParentNode.children = {};
      }
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

      if (!draftDestParentNode.children) {
        draftDestParentNode.children = {};
      }
      if (draftDestParentNode.children[destName]) {
        throw new Error('Destination already exists');
      }
      draftDestParentNode.children[destName] = JSON.parse(JSON.stringify(draftSourceNode)) as FileSystemNode;
    });
  }
  throw new Error('Source file/directory not found or destination directory not found');
};