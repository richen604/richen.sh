import { createStore } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { type CommandParams } from "../commands";
import { fileSystemAtom } from "../utils/filesystem";

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
        return normalize(storage.getItem(key, initialValue));
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
  return value.filter((entry): entry is string => {
    if (typeof entry !== "string") return false;
    try {
      const item: unknown = JSON.parse(entry);
      return typeof item === "object" && item !== null &&
        typeof (item as Record<string, unknown>).componentKey === "string";
    } catch {
      return false;
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
