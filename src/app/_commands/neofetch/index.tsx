// Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.
"use-client";
import Image from "next/image";
import { type BrowserInfo } from "./handle";
import chrome from "@/public/chrome.svg";
import firefox from "@/public/firefox-browser.svg";
import safari from "@/public/safari.svg";
import edge from "@/public/edge.svg";
import opera from "@/public/opera.svg";
import brave from "@/public/brave.svg";

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

const neofetch = ({ browserInfo }: { browserInfo: BrowserInfo }) => {
  return (
    <div className="flex m-4">
      <div className="w-1/4">
        <Image
          className="filter invert"
          priority
          src={handleBrowserSvg(browserInfo.browserName)!}
          width={250}
          height={250}
          alt="Neofetch Image"
        />
      </div>
      <div className="w-3/4 p-4">
        <div>Browser Name: {browserInfo.browserName}</div>
        <div>Browser Version: {browserInfo.browserVersion}</div>
        <div>OS Name: {browserInfo.osName}</div>
        <div>OS Version: {browserInfo.osVersion}</div>
        <div>Device Model: {browserInfo.deviceModel}</div>
        <div>Device Type: {browserInfo.deviceType}</div>
        <div>Device Vendor: {browserInfo.deviceVendor}</div>
      </div>
    </div>
  );
};

export default neofetch;
