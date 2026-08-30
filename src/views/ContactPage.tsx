import { useAtom } from "jotai";

import Contact from "../app/commands/contact";
import TerminalLayout from "../app/components/TerminalLayout";
import { fileSystemAtom } from "../app/utils/filesystem";

export default function ContactPage() {
  const [filesystem] = useAtom(fileSystemAtom);
  const timestamp = new Date();
  const commandParams = {
    args: [],
    flags: {},
    all: [],
    timestamp: timestamp.toISOString(),
    filesystem,
  };

  return (
    <TerminalLayout showCLI={false}>
      <div className="display-item">
        <div className="p-2 flex justify-between items-center">
          <span>&gt; contact</span>
          <span className="text-nowrap ml-2 text-gray-500 text-xs md:text-sm lg:text-base">
            {timestamp.toLocaleTimeString()}
          </span>
        </div>
        <Contact {...commandParams} />
      </div>
    </TerminalLayout>
  );
}
