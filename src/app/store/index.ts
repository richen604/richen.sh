"use client";
import { atom, createStore } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { type CommandParams } from "../commands";

export type DisplayItem = {
  componentKey: string;
  props: CommandParams;
  timestamp: string;
};

export const store = createStore();

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
  createJSONStorage(),
  {
    getOnInit: true,
  }
);

export const inputAtom = atomWithStorage<string>('terminal-input', '');

export const historyAtom = atomWithStorage<string[]>('terminal-history', []);
export const historyIndexAtom = atomWithStorage<number>('terminal-history-index', -1);
