// Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.
import Image from "next/image";

import chrome from "@/public/chrome.svg";
import firefox from "@/public/firefox-browser.svg";
import safari from "@/public/safari.svg";
import edge from "@/public/edge.svg";
import opera from "@/public/opera.svg";
import brave from "@/public/brave.svg";
export { default as handleNeofetch } from "./handle";

const handleBrowserSvg = (browser: string | undefined) => {
  switch (browser) {
    case "Brave":
      return brave as string;
    case "Opera":
      return opera as string;
    case "Edge":
      return edge as string;
    case "Safari":
      return safari as string;
    case "Chrome":
      return chrome as string;
      break;
    case "Firefox":
      return firefox as string;
    case undefined:
      return "";
    default:
      break;
  }
};

const neofetch = ({ result }: { result: UAParser.IResult }) => {
  return (
    <div className="flex m-4">
      <div className="w-1/4">
        <Image
          className="filter invert"
          priority
          src={handleBrowserSvg(result.browser.name)!}
          width={250}
          height={250}
          alt="Neofetch Image"
        />
      </div>
      <div className="w-3/4">
        <div className="mb-2">
          <div>Browser Name: {result.browser.name ?? "N/A"}</div>
          <div>Browser Version: {result.browser.version ?? "N/A"}</div>
        </div>
        <hr className="border-white w-3/4 my-4" />
        <div className="mb-2">
          <div>OS Name: {result.os.name ?? "N/A"}</div>
          <div>OS Version: {result.os.version ?? "N/A"}</div>
        </div>
        <hr className="border-white w-3/4 my-4" />
        <div className="mb-2">
          <div>CPU: {result.cpu.architecture ?? "N/A"}</div>
        </div>
        <hr className="border-white w-3/4 my-4" />
        <div className="mb-2">
          <div>Device Model: {result.device.model ?? "N/A"}</div>
          <div>Device Type: {result.device.type ?? "N/A"}</div>
          <div>Device Vendor: {result.device.vendor ?? "N/A"}</div>
        </div>
      </div>
    </div>
  );
};

export default neofetch;
