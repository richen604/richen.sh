"use client";

import { displayAtom, store } from "@/app/_store/terminalAtoms";
import UAParser from "ua-parser-js";

export type BrowserInfo = {
  browserName: string | undefined;
  browserVersion: string | undefined;
  osName: string | undefined;
  osVersion: string | undefined;
  deviceModel: string;
  deviceType: string;
  deviceVendor: string;
};

const handleNeofetch = () => {
  const parser = new UAParser();
  const result = parser.getResult();

  console.log(result);

  const browserInfo: BrowserInfo = {
    browserName: result.browser.name,
    browserVersion: result.browser.version,
    osName: result.os.name,
    osVersion: result.os.version,
    deviceModel: result.device.model ?? "N/A",
    deviceType: result.device.type ?? "N/A",
    deviceVendor: result.device.vendor ?? "N/A",
  };

  store.set(displayAtom, [
    JSON.stringify({ componentKey: "neofetch", props: { browserInfo } }),
  ]);
};

export default handleNeofetch;
