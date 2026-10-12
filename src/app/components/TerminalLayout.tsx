import { useEffect, useRef, useState } from "react";
import { useAtomValue } from "jotai";
import { displayAtom, store } from "../store";
import { fileSystemAtom } from "../utils/filesystem";
import { TerminalFrame, type TerminalFrameProps } from "./TerminalFrame";
import { navigate } from "../../blog/routes";
import { formatCwd, homePath } from '../utils/identity';

export default function TerminalLayout({ children, reading = false, startAtTop = false, outputKey, ...props }: TerminalFrameProps & { reading?: boolean; startAtTop?: boolean; title?: string; outputKey?: number | string }) {
  const display = useAtomValue(displayAtom);
  const filesystem = useAtomValue(fileSystemAtom);
  const inputRef = useRef<HTMLInputElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);
  const [clock, setClock] = useState("--:--:--");
  const initialOutput = useRef({ display: JSON.stringify(display), outputKey });
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("en-US", { hour12: false }));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const output = displayRef.current;
    if (!output || reading) return;
    const last = output.lastElementChild as HTMLElement | null;
    const article = last?.dataset.command === "blog";
    const comparison = startAtTop && JSON.stringify(display) === initialOutput.current.display && outputKey === initialOutput.current.outputKey;
    let follow = true;
    const align = () => {
      if (follow) output.scrollTop = comparison ? 0 : article && last ? last.offsetTop - output.offsetTop : output.scrollHeight;
    };
    const stop = () => { if (article || comparison) follow = false; };
    const scroll = () => { if (!article && !comparison) follow = output.scrollHeight - output.clientHeight - output.scrollTop < 2; };
    align();
    // Async command output and font layout can grow after the display atom changes.
    // Follow terminal output, but keep articles at their start until reader scrolls.
    const mutations = new MutationObserver(align);
    mutations.observe(output, { childList: true, subtree: true, characterData: true });
    const resize = new ResizeObserver(align);
    resize.observe(output);
    if (last) resize.observe(last);
    output.addEventListener("scroll", scroll);
    for (const event of ["wheel", "touchstart", "pointerdown", "keydown"]) output.addEventListener(event, stop);
    if (!article && props.showCLI !== false && window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus({ preventScroll: true });
    return () => {
      mutations.disconnect();
      resize.disconnect();
      output.removeEventListener("scroll", scroll);
      for (const event of ["wheel", "touchstart", "pointerdown", "keydown"]) output.removeEventListener(event, stop);
    };
  }, [display, reading, props.showCLI, outputKey, startAtTop]);
  const section = window.location.pathname.split("/")[1];
  const activeTab = section === "blog" || section === "projects" || section === "contact" ? section : "terminal";
  return <TerminalFrame activeTab={activeTab} {...props} inputRef={inputRef} displayRef={displayRef} clock={clock}
    onClick={props.onClick ?? (event => {
      if (!reading && props.showCLI !== false && window.matchMedia("(pointer: fine)").matches
        && !window.getSelection()?.toString()
        && !(event.target as HTMLElement).closest('button, select, input, textarea, a, [role="button"], [role="menu"], [role="menuitem"], .blog-content')) {
        inputRef.current?.focus({ preventScroll: true });
      }
    })}
    cwd={reading ? homePath : formatCwd(filesystem.cwd)}
    onHelp={props.onHelp ?? (() => { navigate("/"); store.set(displayAtom, [JSON.stringify({ componentKey: "help", timestamp: new Date().toISOString(), props: { all: [] } })]); })}
    onClear={props.onClear ?? (() => { navigate("/"); store.set(displayAtom, []); })}>{children}</TerminalFrame>;
}
