import { useAtomValue } from "jotai";
import { componentMap } from "../app/commands";
import { CommandEntry } from "../app/components/CommandEntry";
import TerminalLayout from "../app/components/TerminalLayout";
import useCommands from "../app/hooks/useCommands";
import { displayAtom, fileSystemAtom, store } from "../app/store";
import { navigate } from "../blog/routes";
import { SiteBanner } from "../blog/SiteBanner";
import eightg518k from "../../content/assets/art/homepage/8g518k.art.json?prepared";

/** Direct routes show only their requested output, without replacing saved history. */
export default function CommandPage({ command, args = [], path }: {
  command: "blog" | "projects" | "contact"; args?: string[]; path?: string;
}) {
  const filesystem = useAtomValue(fileSystemAtom);
  const params = { args, flags: {}, all: args, timestamp: "", filesystem };
  const Component = componentMap[command];
  const { handleKeyDown, executeCommand } = useCommands(() => {
    const start = store.get(displayAtom).length;
    store.set(displayAtom, previous => [...previous, JSON.stringify({
      componentKey: command, props: params, timestamp: new Date().toISOString(),
    })]);
    navigate("/", true, undefined, start);
    return false;
  });

  return <TerminalLayout reading onKeyDown={handleKeyDown}
    onHelp={() => executeCommand("help")} onClear={() => executeCommand("clear")}>
    {(command !== "blog" || !args.length) && <SiteBanner artifact={eightg518k} />}
    <CommandEntry command={command} args={args}>
      <Component {...params} pagePath={path} />
    </CommandEntry>
  </TerminalLayout>;
}
