import type { ReactNode } from "react";

export function CommandEntry({ command, args = [], timestamp, children }: {
  command: string; args?: string[]; timestamp?: string; children: ReactNode;
}) {
  const time = timestamp && !Number.isNaN(Date.parse(timestamp))
    ? new Date(timestamp).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "";
  return <div className="display-item" data-command={command}>
    <div className="p-2 flex justify-between items-center"><span>{`> ${command}${args.length ? ` ${args.join(" ")}` : ""}`}</span>
      <span className="text-nowrap ml-2 text-gray-500 text-xs md:text-sm lg:text-base">{time}</span>
    </div>{children}
  </div>;
}
