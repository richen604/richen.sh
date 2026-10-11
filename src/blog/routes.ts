import { posts } from "./registry";

export function blogPath(args: string[]) {
  if (!args.length) return "/blog/";
  return posts.some((post) => post.slug === args[0]) ? `/blog/${args[0]}/` : null;
}
export function recognizeBlog(pathname: string) {
  const match = /^\/blog(?:\/([a-z0-9]+(?:-[a-z0-9]+)*))?\/?$/.exec(pathname);
  return match ? blogPath(match[1] ? [match[1]] : []) : null;
}
export function terminalHistoryEntry() {
  const state: unknown = window.history.state;
  return typeof state === "object" && state !== null && "terminal" in state && state.terminal === true;
}
export function terminalDisplayLength() {
  const state: unknown = window.history.state;
  if (typeof state !== "object" || state === null || !("displayLength" in state)) return undefined;
  return typeof state.displayLength === "number" && Number.isInteger(state.displayLength) && state.displayLength >= 0 ? state.displayLength : undefined;
}
export function terminalDisplayStart() {
  const state: unknown = window.history.state;
  if (typeof state !== "object" || state === null || !("displayStart" in state)) return 0;
  return typeof state.displayStart === "number" && Number.isInteger(state.displayStart) && state.displayStart >= 0 ? state.displayStart : 0;
}
/** All app URL changes go through one event; popstate never dispatches commands. */
export function navigate(path: string, terminal = false, displayLength?: number, displayStart = terminal ? terminalDisplayStart() : 0) {
  const state = { terminal, displayLength, displayStart };
  if (window.location.pathname !== path || terminalHistoryEntry() !== terminal) window.history.pushState(state, "", path);
  else window.history.replaceState(state, "", path);
  window.dispatchEvent(new Event("terminal-navigation"));
}
