// Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.
import React from "react";
import { UAParser } from "ua-parser-js";
import { type CommandParams } from "..";


const handleBrowserSvg = (browser: string | undefined) => {
  switch (browser) {
    case "Brave":
      return "/brave.svg";
    case "Opera":
      return "/opera.svg";
    case "Edge":
      return "/edge.svg";
    case "Safari":
      return "/safari.svg";
    case "Chrome":
      return "/chrome.svg";
    case "Firefox":
      return "/firefox-browser.svg";
    default:
      return "";
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Neofetch = ({ args }: CommandParams) => {
  const [result, setResult] = React.useState<UAParser.IResult | null>(null);

  React.useEffect(() => {
    const parser = new UAParser();
    const parsedResult = parser.getResult();
    setResult(parsedResult);
  }, []);

  if (!result) return null;

  const browserImage = handleBrowserSvg(result.browser.name);

  return (
    <div className="flex flex-col md:flex-row m-2">
      <div className="w-full md:w-1/3 mb-4 md:mb-0">
        {browserImage ? (
          <img
            className="filter invert p-2"
            src={browserImage}
            width={220}
            height={220}
            alt={`${result.browser.name} browser logo`}
          />
        ) : (
          <div className="p-2" role="img" aria-label="Unknown browser">
            Unknown browser
          </div>
        )}
      </div>
      <div className="w-full md:w-2/3 text-sm">
        <div className="mb-1">
          <div>Browser Name: {result.browser.name ?? "N/A"}</div>
          <div>Browser Version: {result.browser.version ?? "N/A"}</div>
        </div>
        <hr className="border-white w-full md:w-2/3 my-2" />
        <div className="mb-1">
          <div>OS Name: {result.os.name ?? "N/A"}</div>
          <div>OS Version: {result.os.version ?? "N/A"}</div>
        </div>
        <hr className="border-white w-full md:w-2/3 my-2" />
        <div className="mb-1">
          <div>CPU: {result.cpu.architecture ?? "N/A"}</div>
        </div>
        <hr className="border-white w-full md:w-2/3 my-2" />
        <div className="mb-1">
          <div>Device Model: {result.device.model ?? "N/A"}</div>
          <div>Device Type: {result.device.type ?? "N/A"}</div>
          <div>Device Vendor: {result.device.vendor ?? "N/A"}</div>
        </div>
      </div>
    </div>
  );
};

export default Neofetch;
