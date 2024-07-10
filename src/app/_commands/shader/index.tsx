/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import React from "react";

import Head from "next/head";
import Script from "next/script";
import "@/public/css/style.css";

const index = () => {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          content="twigl.app is an online editor for One tweet shader, with gif or webm generator and sound shader."
          name="description"
        />

        <meta property="og:url" content="https://twigl.app" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="twigl.app" />
        <meta
          property="og:description"
          content="twigl.app is an online editor for One tweet shader, with gif or webm generator and sound shader."
        />
        <meta property="og:site_name" content="twigl.app" />
        <meta property="og:image" content="/resource/ogp.png" />

        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/resource/favicons/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/x-icon"
          sizes="32x32"
          href="/resource/favicons/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/x-icon"
          sizes="16x16"
          href="/resource/favicons/favicon-16x16.png"
        />
        <link rel="manifest" href="/resource/favicons/site.webmanifest" />
        <link
          rel="mask-icon"
          href="/resource/favicons/safari-pinned-tab.svg"
          color="#1da1f2"
        />
        <link rel="shortcut icon" href="/resource/favicons/favicon.ico" />
        <meta name="msapplication-TileColor" content="#141414" />
        <meta
          name="msapplication-config"
          content="/resource/favicons/browserconfig.xml"
        />
        <meta name="theme-color" content="#141414" />

        <link rel="stylesheet" href="/css/style.css" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow:wght@300;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Overpass+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />

        <title>twigl.app</title>
      </Head>
      <Script src="/js/ace.js" strategy="beforeInteractive"></Script>
      <Script
        src="/js/CCapture.all.min.js"
        strategy="beforeInteractive"
      ></Script>
      <Script src="/js/script.js" strategy="afterInteractive"></Script>
      <div id="wrap">
        <div id="canvaswrap">
          <canvas id="webgl"></canvas>
          <div id="globaliconwrap">
            <div id="globaliconcolumn">
              <div
                id="informationicon"
                className="globaliconinner"
                title="information"
              >
                <img src="/resource/info.svg" />
              </div>
              <div
                id="broadcasticon"
                className="globaliconinner"
                title="broadcast mode"
              >
                <img src="/resource/bloadcast.svg" />
              </div>
              <div
                id="fullscreenicon"
                className="globaliconinner"
                title="fullscreen mode"
              >
                <img src="/resource/fullscreen.svg" />
              </div>
              <div
                id="hidemenuicon"
                className="globaliconinner"
                title="hide editor"
              >
                <img className="hidemenu" src="/resource/hidemenu.svg" />
              </div>
              <div
                id="showmenuicon"
                className="globaliconinner"
                title="show editor"
              >
                <img className="showmenu" src="/resource/showmenu.svg" />
              </div>
              <div
                id="togglemenuicon"
                className="globaliconinner"
                title="toggle edit mode"
              >
                <img src="/resource/togglemenu.svg" />
              </div>
              <div
                id="noteicon"
                className="globaliconinner"
                title="import audio from local"
              >
                <img src="/resource/note.svg" />
              </div>
              <div id="globaliconcolumnmargin"></div>
              <div id="eyeiconwrap">
                <img src="/resource/eye.svg" />
                <div id="eyecounterwrap">
                  <div id="eyecounter">000</div>
                  <div id="eyeoverlay">000</div>
                </div>
              </div>
              <div id="stariconwrap">
                <img src="/resource/heart.svg" />
                <div id="starcounterwrap">
                  <div id="starcounter">000</div>
                  <div id="staroverlay">000</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="editorwrap">
          <div id="interface">
            <div id="main" className="editorblock">
              <div id="lineout" className="lineout">
                <div id="pausewrap">
                  <div id="pause">
                    <div id="pausecaption">render</div>
                    <label>
                      <input
                        id="pausetoggle"
                        className="toggle"
                        type="checkbox"
                        checked
                      />
                      <div className="togglebutton"></div>
                    </label>
                  </div>
                </div>
                <div className="counter">
                  <div id="counter"></div>
                  <div className="counterchars">chars</div>
                </div>
                <div id="snapshotdate"></div>
                <div id="message" className="message"></div>
              </div>
              <pre id="editor" className="editor"></pre>
            </div>
            <div id="menu">
              <div id="broadcastblock" className="menublock invisible">
                <div className="h3wrap">
                  <h3>Broadcast</h3>
                </div>
                <div className="menublockinner">director name or group.</div>
              </div>
              <div className="menublock">
                <div className="h3wrap">
                  <h3
                    title={`classic: An ordinary shader editor.
geek: Uniform variables become a single character.
geeker: geek mode + you don't have to define precision and uniform variables by yourself.
geekest: geeker mode + 'void main(){}' can be omitted, 'gl_FragCoord' can be described as 'FC'. In addition, a variety of GLSL snippets are available.`}
                    style={{ cursor: "help" }}
                  >
                    Regulation
                  </h3>
                </div>
                <div className="menublockinner">
                  <select className="dropdown" id="modeselect">
                    <option value="0">classic</option>
                    <option value="1">geek</option>
                    <option value="2">geeker</option>
                    <option value="3">geekest</option>
                    <option value="4">classic (300 es)</option>
                    <option value="5">geek (300 es)</option>
                    <option value="6">geeker (300 es)</option>
                    <option value="7">geekest (300 es)</option>
                    <option value="8">classic (MRT)</option>
                    <option value="9">geek (MRT)</option>
                    <option value="10">geeker (MRT)</option>
                    <option value="11">geekest (MRT)</option>
                  </select>
                </div>
              </div>
              <div id="exportblock" className="menublock">
                <div className="h3wrap">
                  <h3
                    title="generate animation GIF or WebM"
                    style={{ cursor: "help" }}
                  >
                    Export
                  </h3>
                </div>
                <div className="menublockinner">
                  <div className="menublockselectwrap">
                    <select className="dropdown" id="frameselect">
                      <option value="60">60 frames</option>
                      <option value="120" selected>
                        120 frames
                      </option>
                      <option value="180">180 frames</option>
                      <option value="240">240 frames</option>
                      <option value="300">300 frames</option>
                      <option value="360">360 frames</option>
                      <option value="94">94 frames</option>
                      <option value="188">188 frames</option>
                      <option value="376">376 frames</option>
                      <option value="752">752 frames</option>
                      <option value="1504">1504 frames</option>
                      <option value="1880">1880 frames</option>
                    </select>
                    <select className="dropdown" id="sizeselect">
                      <option value="128x128">128 x 128</option>
                      <option value="256x128">256 x 128</option>
                      <option value="256x256">256 x 256</option>
                      <option value="512x256" selected>
                        512 x 256
                      </option>
                      <option value="512x512">512 x 512</option>
                      <option value="1024x512">1024 x 512</option>
                      <option value="1024x1024">1024 x 1024</option>
                      <option value="2048x1024">2048 x 1024</option>
                      <option value="2048x2048">2048 x 2048</option>
                    </select>
                  </div>
                  <div className="menublockbuttonwrap">
                    <div
                      id="downloadgif"
                      className="button"
                      title="info: If over 15MB GIF image that impossible attach to Twitter. You can use WebM instead of GIF."
                    >
                      Download
                    </div>
                    <div
                      id="permanentlink"
                      className="button"
                      title="Generate permanent link."
                    >
                      Generate LINK
                    </div>
                  </div>
                </div>
              </div>
              <div id="syncscrollblock" className="menublock invisible">
                <div className="h3wrap">
                  <h3>Sync scroll on Editor</h3>
                </div>
                <div className="menublockinner">
                  <label>
                    <input
                      id="syncscrolltoggle"
                      className="toggle"
                      type="checkbox"
                      checked
                    />
                    <div className="togglebutton"></div>
                  </label>
                </div>
              </div>
              <div id="authorblock" className="menublock">
                <div className="h3wrap">
                  <h3>Author / GitHub</h3>
                </div>
                <div id="links" className="menublockinner">
                  <a
                    href="https://twitter.com/h_doxas"
                    target="_blank"
                    id="twitter"
                  >
                    doxas
                  </a>
                  <div id="twitterdummy"></div>
                  <a
                    href="https://github.com/doxas/twigl"
                    target="_blank"
                    id="github"
                  >
                    twigl
                  </a>
                  <div id="githubdummy"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="layer">
          <div id="dialog">
            <div id="dialogmessagewrap">
              <div id="dialogmessage"></div>
            </div>
            <div id="dialogbuttonwrap">
              <div id="dialogbuttonok" className="dialogbutton">
                ok
              </div>
              <div id="dialogbuttoncancel" className="dialogbutton">
                cancel
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default index;
