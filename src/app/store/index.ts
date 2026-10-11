import { createStore } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { type CommandParams } from "../commands";
import { fileSystemAtom, migrateSavedPath, normalizeFileSystem, type FileSystem } from "../utils/filesystem";

export type DisplayItem = {
  componentKey: string;
  props: CommandParams;
  timestamp: string;
};

export const store = createStore();

type LocalStorage<T> = {
  getItem: (key: string, initialValue: T) => T;
  setItem: (key: string, value: T) => void;
  removeItem: (key: string) => void;
};

const validatingStorage = <T>(normalize: (value: unknown) => T): LocalStorage<T> => {
  const storage = createJSONStorage<unknown>(() => localStorage);
  return {
    getItem(key, initialValue) {
      try {
        const saved = storage.getItem(key, initialValue);
        const normalized = normalize(saved);
        if (JSON.stringify(saved) !== JSON.stringify(normalized)) {
          try { storage.setItem(key, normalized); } catch { /* Keep readable data when storage is full or read-only. */ }
        }
        return normalized;
      } catch {
        return initialValue;
      }
    },
    setItem(key, value) {
      storage.setItem(key, value);
    },
    removeItem(key) {
      storage.removeItem(key);
    },
  };
};

const normalizeDisplay = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry): string[] => {
    if (typeof entry !== "string") return [];
    try {
      const item: unknown = JSON.parse(entry);
      if (typeof item !== "object" || item === null) return [];
      const record = item as Record<string, unknown>;
      if (typeof record.componentKey !== 'string') return [];
      if (record.props && typeof record.props === 'object') {
        const props = record.props as Record<string, unknown>;
        if (props.filesystem) {
          const original = props.filesystem as FileSystem;
          const fs = normalizeFileSystem(props.filesystem);
          props.filesystem = fs;
          if (['cat', 'cd', 'mkdir', 'mv', 'rm', 'touch', 'ls', 'cp', 'cwd', 'pwd'].includes(record.componentKey)) {
            for (const key of ['args', 'all']) {
              if (Array.isArray(props[key])) props[key] = (props[key] as unknown[]).map(arg => typeof arg === 'string' ? migrateSavedPath(fs, arg, original) : arg);
            }
          }
        }
      }
      return [JSON.stringify(item)];
    } catch {
      return [];
    }
  });
};

const normalizeHistory = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];

const normalizeHistoryIndex = (value: unknown): number =>
  typeof value === "number" && Number.isInteger(value) && value >= -1 ? value : -1;

export const displayAtom = atomWithStorage<string[]>(
  "terminal-display",
  [
    JSON.stringify({
      componentKey: "help",
      timestamp: new Date().toISOString(),
      props: {
        all: [],
      },
    }),
  ],
  validatingStorage(normalizeDisplay),
  { getOnInit: true }
);

export const historyAtom = atomWithStorage<string[]>('terminal-history', [], validatingStorage(normalizeHistory), { getOnInit: true });
export const historyIndexAtom = atomWithStorage<number>('terminal-history-index', -1, validatingStorage(normalizeHistoryIndex), { getOnInit: true });

export { fileSystemAtom };
