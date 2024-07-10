import "whatwg-fetch";
import Promise from "promise-polyfill";
import { Fragmen } from "./fragmen.js";
import { registerCursorTimeout } from "./registerCursorTimeout.js";

(() => {
  console.log("Hello, world!");
  let wrap = null; // Wrapper DOM that wraps almost everything
  let canvas = null; // Screen
  let mode = null; // Variable mode select
  let animate = null; // Toggle for animation


  let currentMode = Fragmen.MODE_CLASSIC; // Current Fragmen mode
  let currentSource = ""; // Latest source code

  let fragmen = null; // Instance of fragmen.js

  let graphicsDisable = false; // Whether to disable the graphics editor
  let disableAttachEvent = false; // Set to true to prevent setting beforeunload when editing code

  /** Function to remove the process added by {@link registerCursorTimeout} */
  let unregisterCursorTimeout = null;

  // Template for options used in fragmen.js
  const FRAGMEN_OPTION = {
    target: null,
    eventTarget: null,
    mouse: true,
    resize: true,
    escape: false,
  };

  // Base URL for making requests to external services
  const BASE_URL = location.origin;

  window.addEventListener(
    "DOMContentLoaded",
    () => {
      // References to the DOM
      wrap = document.querySelector("#wrap");
      canvas = document.querySelector("#webgl");
      message = document.querySelector("#message");
      mode = document.querySelector("#modeselect");
      animate = document.querySelector("#pausetoggle");
      frames = document.querySelector("#frameselect");
      link = document.querySelector("#permanentlink");
      layer = document.querySelector("#layer");
      dialog = document.querySelector("#dialogmessage");
      infoIcon = document.querySelector("#informationicon");
      fullIcon = document.querySelector("#fullscreenicon");
      starIcon = document.querySelector("#stariconwrap");
      menuIcon = document.querySelector("#togglemenuicon");
      noteIcon = document.querySelector("#noteicon");
      hideIcon = document.querySelector("#hidemenuicon");
      showIcon = document.querySelector("#showmenuicon");
      syncToggle = document.querySelector("#syncscrolltoggle");

      // Get the default source list from fragmen
      const fragmenDefaultSource = Fragmen.DEFAULT_SOURCE;

      // Flag to determine whether to hide the menu and editor
      let isLayerHidden = false;

      // Parse URL GET parameters
      urlParameter = getParameter();
      urlParameter.forEach((value, key) => {
        switch (key) {
          case "mode":
            currentMode = parseInt(value);
            break;
          case "source":
            currentSource = value;
            break;
            break;
          case "gd": // graphics director
            currentDirectorId = value;
            break;
          case "sd": // sound director
            currentDirectorId = value;
            break;
          case "fd": // friend director
            friendDirectorId = value;
            break;
          case "dm": // direction mode
            directionMode = value;
            let directionFlag = Object.entries(BROADCAST_DIRECTION).some(
              ([key, val]) => {
                return val === value;
              }
            );
            if (directionFlag !== true) {
              directionMode = null;
            }
            break;
          case "ss":
            currentSnapshotId = value;
            break;
          case "ch": // channel
            currentChannelId = value;
            break;
          case "ow": // is owner
            isOwner = value === "true";
            break;
          case "ol": // overlay (hide menu view)
            wrap.classList.add("overlay");
            isLayerHidden = true;
            break;
        }
      });
      // Check if the current mode obtained from the URL parameters exists
      if (fragmenDefaultSource[currentMode] != null) {
        mode.selectedIndex = currentMode;
      } else {
        currentMode = Fragmen.MODE_CLASSIC;
      }
      // If the current source is empty at this point, use the default source
      if (currentSource === "") {
        if (currentChannelId != null || currentSnapshotId != null) {
          // In the case of broadcast or snapshot, leave it empty
          // To prevent the default shader from being loaded for a moment initially
        } else {
          currentSource = fragmenDefaultSource[currentMode];
        }
      }

      // If there is a channel ID, consider it related to broadcasting
      let invalidURL = false;
      if (currentChannelId != null && directionMode != null) {
        if (currentDirectorId != null) {
          // If there is a director ID, it is not a viewer but one of the broadcasters
          if (isOwner === true) {
            // At this point, being the owner means the recovery URL was clicked
            // This means that information to be recovered from Firebase must be obtained first
            // isDirectorInitialized is usually true, but set to false until initialization is complete
            isDirectorInitialized = false;
            broadcastSetting = { validation: true, assign: "both" };
            // Check if there is a friend
            if (friendDirectorId != null) {
              // If there is a friend, make the editor of the inviter non-editable
              if (directionMode === BROADCAST_DIRECTION.GRAPHICS) {
                // The friend is in charge of sound
                soundDisable = true;
                broadcastSetting.assign = BROADCAST_ASSIGN.INVITE_SOUND;
              } else {
                // The friend is in charge of graphics
                graphicsDisable = true;
                disableRegulation();
                broadcastSetting.assign = BROADCAST_ASSIGN.INVITE_GRAPHICS;
              }
            }
            // In the case of the owner, it is necessary to be able to redisplay the URL by pressing the broadcast icon, so generate it in advance
            ownerURL =
              BASE_URL +
              "?" +
              generateDirectorURL(
                currentMode,
                directionMode,
                broadcastSetting.assign,
                currentDirectorId,
                currentChannelId,
                friendDirectorId
              );
            if (friendDirectorId != null) {
              friendURL =
                BASE_URL +
                "?" +
                generateFriendURL(
                  currentMode,
                  directionMode,
                  broadcastSetting.assign,
                  currentDirectorId,
                  currentChannelId,
                  friendDirectorId
                );
            }
            shareURL = `${BASE_URL}?ch=${currentChannelId}&dm=${directionMode}`;
            // Broadcast mode is owner
            broadcastMode = "owner";
          } else {
            // Invited side
            if (friendDirectorId != null) {
              // In the case of a friend, it is necessary to restore the code just like the owner
              isDirectorInitialized = false;
              // At this point, friend == owner director, so the owner's editor should be non-editable
              if (directionMode === BROADCAST_DIRECTION.GRAPHICS) {
                // Owner is in charge of graphics
                graphicsDisable = true;
                // Regulations cannot be operated from the friend's side
                disableRegulation();
              } else {
                // Owner is in charge of sound
                soundDisable = true;
              }
              // Broadcast mode is friend
              broadcastMode = "friend";
            } else {
              // It would mean there is no owner, which is invalid
              invalidURL = true;
            }
          }
        } else {
          // In the case of a viewer, the editor is forcibly set to read-only
          graphicsDisable = true;
          soundDisable = true;
          // Broadcast mode is audience
          broadcastMode = "audience";
        }
      }

      if (invalidURL === true) {
        // Since something was considered an invalid URL, proceed with the normal initialization flow
        currentDirectorId = null;
        friendDirectorId = null;
        currentChannelId = null;
        broadcastSetting = null;
        broadcastForm = null;
        directionMode = null;
        friendDirectionMode = null;
        isOwner = null;
        shareURL = "";
        ownerURL = "";
        friendURL = "";
        graphicsDisable = false;
        soundDisable = false;
        broadcastMode = "none";
      }

      // Initialization related to Ace editor
      let timeoutId = null;
      editor = editorSetting(
        "editor",
        currentSource,
        (evt) => {
          // Only perform if event setting is not suppressed
          if (disableAttachEvent !== true) {
            // If not a broadcast viewer and has never been edited, set it once
            if (isEdit !== true && broadcastMode !== "audience") {
              isEdit = true;
              window.addEventListener(
                "beforeunload",
                (evt) => {
                  evt.preventDefault();
                  evt.returnValue = "";
                },
                false
              );
            }
            isEdit = true;
          } else {
            disableAttachEvent = false;
          }
          // Cancel the timer if within 1 second
          if (timeoutId != null) {
            clearTimeout(timeoutId);
          }
          timeoutId = setTimeout(() => {
            timeoutId = null;
            update(editor.getValue());
          }, 1000);
          // Output the number of characters
          counter.textContent = `${editor.getValue().length}`;
        },
        (evt) => {
          // During broadcast, send the state regardless of the status
          if (
            currentChannelId != null &&
            (broadcastMode === "owner" || broadcastMode === "friend")
          ) {
            // Whether in charge of editing graphics
            if (
              (broadcastMode === "owner" &&
                directionMode !== BROADCAST_DIRECTION.SOUND) ||
              (broadcastMode === "friend" &&
                directionMode === BROADCAST_DIRECTION.SOUND)
            ) {
              updateGraphicsData(
                currentDirectorId,
                currentChannelId,
                currentMode
              );
            }
          }
        }
      );

      // On window resize
      window.addEventListener(
        "resize",
        () => {
          resize();
        },
        false
      );
      // Perform resize equivalent processing once initially
      resize();

      // On mode change
      mode.addEventListener(
        "change",
        () => {
          const defaultSourceInPrevMode = fragmenDefaultSource[currentMode];

          const source = editor.getValue();
          currentMode = parseInt(mode.value);
          fragmen.mode = currentMode;

          // If the source is the same as the default source, replace it with the default source for the new mode
          if (source === defaultSourceInPrevMode) {
            const defaultSource = fragmenDefaultSource[currentMode];
            editor.setValue(defaultSource);
            setTimeout(() => {
              editor.gotoLine(1);
            }, 100);
          } else {
            // Even if the source is not replaced, rebuild it
            update(editor.getValue());
          }
        },
        false
      );

      // Toggle for enabling/disabling animation
      animate.addEventListener(
        "change",
        () => {
          if (animate.checked === true) {
            // If turned on, compile
            if (fragmen != null) {
              fragmen.setAnimation(true);
              update(editor.getValue());
              fragmen.draw();
            }
          } else {
            // If turned off, switch to non-animation settings
            if (fragmen != null) {
              fragmen.setAnimation(false);
            }
          }
        },
        false
      );

      




      // Main instance of fragmen
      const option = Object.assign(FRAGMEN_OPTION, {
        target: canvas,
        eventTarget: window,
      });
      fragmen = new Fragmen(option);
      // Update message when shader is updated
      fragmen.onBuild((status, msg) => {

        
        
        // Send status regardless of the state during broadcasting
        if (
          currentChannelId != null &&
          (broadcastMode === "owner" || broadcastMode === "friend")
        ) {
          // Whether you are in a position to edit graphics
          if (
            (broadcastMode === "owner" &&
              directionMode !== BROADCAST_DIRECTION.SOUND) ||
            (broadcastMode === "friend" &&
              directionMode === BROADCAST_DIRECTION.SOUND)
          ) {
            updateGraphicsData(
              currentDirectorId,
              currentChannelId,
              currentMode
            );
          }
        }
      });
      fragmen.onDraw(() => {
        let freq = 0.0;
        if (musician != null && musician.isPlay === true) {
          freq += musician.getFrequencyFloat();
        }
        if (
          onomat != null &&
          audioToggle.checked === true &&
          latestAudioStatus === "success"
        ) {
          freq += onomat.getFrequencyFloat();
        }
        if (freq > 0.0) {
          fragmen.setFrequency(freq);
        }
      });
      // Output the default message
      counter.textContent = `${currentSource.length}`;
      message.textContent = " ● ready";

      // Start rendering
      // If currentSource is empty, wait for Broadcast or Snapshot
      if (currentSource !== "") {
        fragmen.mode = currentMode;
        fragmen.render(currentSource);
      }

      // Change the state of the dropdown list depending on whether WebGL 2.0 is supported
      if (fragmen.isWebGL2 !== true) {
        for (let i = 0; i < mode.children.length; ++i) {
          mode.children[i].disabled = Fragmen.MODE_WITH_ES_300.includes(i);
        }
      }

      // Sound shader related
      audioToggle.addEventListener(
        "change",
        () => {
          onomatSetting();
        },
        false
      );
      audioPlayIcon.addEventListener(
        "click",
        () => {
          if (audioToggle.checked !== true || latestAudioStatus !== "success") {
            return;
          }
          ++soundPlay;
          updateAudio(audioEditor.getValue(), true);
          // Send status regardless of the state during broadcasting
          if (
            currentChannelId != null &&
            (broadcastMode === "owner" || broadcastMode === "friend")
          ) {
            // Whether you are in a position to edit graphics
            if (
              (broadcastMode === "owner" &&
                directionMode !== BROADCAST_DIRECTION.GRAPHICS) ||
              (broadcastMode === "friend" &&
                directionMode === BROADCAST_DIRECTION.GRAPHICS)
            ) {
              updateSoundData(currentDirectorId, currentChannelId, soundPlay);
            }
          }
        },
        false
      );
      audioStopIcon.addEventListener(
        "click",
        () => {
          if (musician != null) {
            musician.stop();
          }
          if (audioToggle.checked !== true) {
            return;
          }
          onomat.stop();
        },
        false
      );
      window.addEventListener(
        "keydown",
        (evt) => {
          // vim mode
          if (
            (evt.ctrlKey === true || evt.metaKey === true) &&
            evt.altKey === true &&
            (evt.key === "v" || evt.key === "V" || evt.key === "√")
          ) {
            vimMode = !vimMode;
            if (vimMode === true) {
              editor.setKeyboardHandler("ace/keyboard/vim");
              audioEditor.setKeyboardHandler("ace/keyboard/vim");
            } else {
              editor.setKeyboardHandler(null);
              audioEditor.setKeyboardHandler(null);
            }
          }
          if (
            (evt.ctrlKey === true || evt.metaKey === true) &&
            evt.altKey === true &&
            (evt.key === "†" || evt.key === "t")
          ) {
            toggleEditorView();
          }
          if (
            (evt.ctrlKey === true || evt.metaKey === true) &&
            evt.altKey === true &&
            (evt.key === "≤" || evt.key === ",")
          ) {
            --editorFontSize;
            document.querySelector(
              "#editor"
            ).style.fontSize = `${editorFontSize}px`;
            document.querySelector(
              "#editoraudio"
            ).style.fontSize = `${editorFontSize}px`;
          }
          if (
            (evt.ctrlKey === true || evt.metaKey === true) &&
            evt.altKey === true &&
            (evt.key === "≥" || evt.key === ".")
          ) {
            ++editorFontSize;
            document.querySelector(
              "#editor"
            ).style.fontSize = `${editorFontSize}px`;
            document.querySelector(
              "#editoraudio"
            ).style.fontSize = `${editorFontSize}px`;
          }
          if (evt.key === "Enter" && evt.altKey === true) {
            if (evt.ctrlKey === true) {
              if (musician != null) {
                musician.stop();
              }
            }
          }
          // onomat
          if (audioToggle.checked !== true || latestAudioStatus !== "success") {
            return;
          }
          // Play with Alt + Enter, stop with Ctrl + Alt + Enter
          if (evt.key === "Enter" && evt.altKey === true) {
            if (evt.ctrlKey === true) {
              if (musician != null) {
                musician.stop();
              }
              onomat.stop();
            } else {
              ++soundPlay;
              updateAudio(audioEditor.getValue(), true);
              // Send status regardless of the current status during broadcast
              if (
                currentChannelId != null &&
                (broadcastMode === "owner" || broadcastMode === "friend")
              ) {
                // Whether you are in a position to edit graphics
                if (
                  (broadcastMode === "owner" &&
                    directionMode !== BROADCAST_DIRECTION.GRAPHICS) ||
                  (broadcastMode === "friend" &&
                    directionMode === BROADCAST_DIRECTION.GRAPHICS)
                ) {
                  updateSoundData(
                    currentDirectorId,
                    currentChannelId,
                    soundPlay
                  );
                }
              }
            }
          }
        },
        false
      );
      // Output the default message
      audioCounter.textContent = `${Onomat.FRAGMENT_SHADER_SOURCE_DEFAULT.length}`;
      audioMessage.textContent = " ● ready";

      // Listener to restore the DOM when exiting fullscreen
      const onFullscreenChange = (evt) => {
        if (
          document.fullscreenElement == null &&
          document.webkitFullscreenElement == null &&
          document.msFullscreenElement == null
        ) {
          // If all elements are null, manipulate the DOM to display the editor
          exitFullscreenMode();
        }
      };
      // Listener to transition to fullscreen via intentional shortcut key operation instead of F11
      const onFullscreenKeyDown = (evt) => {
        if (
          evt.altKey === true &&
          evt.ctrlKey === true &&
          (evt.key.toLowerCase() === "f" || evt.key === "ƒ")
        ) {
          if (
            document.fullscreenElement != null ||
            document.webkitFullscreenElement != null ||
            document.msFullscreenElement != null
          ) {
            // In this case, it is definitely fullscreened via JavaScript, so forcibly revert it
            // However, the event listener will automatically handle the post-processing
            // Triggering up to document.exitFullscreen, without manipulating the DOM here
            exitFullscreen();
          } else {
            // In this case, it is possible that it is already fullscreened visually via F11
            // F11 fullscreen is treated differently from fullscreen via requestFullscreen, etc.
            // But both can be exited with Escape, so be cautious
            requestFullscreenMode();
          }
        }
      };
      // When the icon is pressed
      const onFullscreenRequest = () => {
        if (
          document.FullscreenElement == null ||
          document.webkitFullscreenElement == null ||
          document.msFullscreenElement == null
        ) {
          requestFullscreenMode();
        }
      };
      // Register fullscreen-related listeners only if the API is supported
      if (document.fullscreenEnabled === true) {
        document.addEventListener(
          "fullscreenchange",
          onFullscreenChange,
          false
        );
        window.addEventListener("keydown", onFullscreenKeyDown, false);
        fullIcon.addEventListener("click", onFullscreenRequest, false);
      } else if (document.webkitFullscreenEnabled === true) {
        document.addEventListener(
          "webkitfullscreenchange",
          onFullscreenChange,
          false
        );
        window.addEventListener("keydown", onFullscreenKeyDown, false);
        fullIcon.addEventListener("click", onFullscreenRequest, false);
      } else {
        // If neither is supported, the API cannot be used to go fullscreen, so hide the icon
        fullIcon.classList.add("nevershow");
      }

      // When the information icon is pressed
      infoIcon.addEventListener(
        "click",
        () => {
          const wrap = document.createElement("div");

          const infoHeader = document.createElement("h3");
          infoHeader.textContent = "Information";
          const infoCaption = document.createElement("div");
          infoCaption.textContent =
            "twigl.app is an online editor for One tweet shader, with GIF generator, sound shader, and broadcast live coding.";
          wrap.appendChild(infoHeader);
          wrap.appendChild(infoCaption);

          const modeHeader = document.createElement("h3");
          modeHeader.textContent = "Edit mode";
          const modeCaption = document.createElement("div");
          const modeMessage = [
            "There are four modes in twigl.app, each of which has a sub-mode that uses GLSL ES 3.0, or in addition to it, a mode that enables MRT.",
            "classic:",
            "This mode is compatible with GLSLSandbox.",
            'The uniform variables are "resolution", "mouse", "time", "frame", and "backbuffer".',
            "geek:",
            "In this mode, the various uniform variables are in a single-character style.",
            '"r", "m", "t", "f", and "b", respectively.',
            "geeker:",
            "In this mode, there is no need to declare precision and uniform. They are automatically complemented on the implementation side. Otherwise, it is the same as in geek mode.",
            "geekest:",
            'In this mode, the description of "void main(){}" can be omitted (or not), and "gl_FragCoord" can be described as "FC". In addition, a variety of GLSL snippets are available.',
            "The reason why we support the notation that does not omit the definition of the main function is to allow users to define their own functions.",
            "For more information on snippets, please see below.",
          ];
          modeMessage.forEach((v) => {
            const e = document.createElement("div");
            e.textContent = v;
            modeCaption.appendChild(e);
          });
          const modeInfoAnchorWrap = document.createElement("div");
          const modeInfoAnchor = document.createElement("a");
          modeInfoAnchor.setAttribute("href", "https://github.com/doxas/twigl");
          modeInfoAnchor.setAttribute("target", "_blank");
          modeInfoAnchor.textContent = "doxas/twigl - GitHub";
          modeInfoAnchorWrap.appendChild(modeInfoAnchor);
          modeCaption.appendChild(modeInfoAnchorWrap);
          wrap.appendChild(modeHeader);
          wrap.appendChild(modeCaption);

          const soundHeader = document.createElement("h3");
          soundHeader.textContent = "Sound Shader";
          const soundCaption = document.createElement("div");
          const soundMessage = [
            "Sound Shader is compatible with the great pioneer, Shadertoy.",
            'Also, the output from the "mainSound" function can be referred to as a uniform variable with the name "sound" or "s" in various graphics modes.',
          ];
          soundMessage.forEach((v) => {
            const e = document.createElement("div");
            e.textContent = v;
            soundCaption.appendChild(e);
          });
          wrap.appendChild(soundHeader);
          wrap.appendChild(soundCaption);

          const authorHeader = document.createElement("h3");
          authorHeader.textContent = "Author";
          const authorCaption = document.createElement("div");
          const authorAnchor = document.createElement("a");
          authorAnchor.textContent = "doxas";
          authorAnchor.setAttribute("href", "https://twitter.com/h_doxas");
          authorAnchor.setAttribute("target", "_blank");
          authorCaption.appendChild(authorAnchor);
          wrap.appendChild(authorHeader);
          wrap.appendChild(authorCaption);

          const sourceHeader = document.createElement("h3");
          sourceHeader.textContent = "Source Code";
          const sourceCaption = document.createElement("div");
          const sourceAnchor = document.createElement("a");
          sourceAnchor.textContent = "doxas/twigl";
          sourceAnchor.setAttribute("href", "https://github.com/doxas/twigl");
          sourceAnchor.setAttribute("target", "_blank");
          sourceCaption.appendChild(sourceAnchor);
          wrap.appendChild(sourceHeader);
          wrap.appendChild(sourceCaption);

          showDialog(wrap, {
            okVisible: true,
            cancelVisible: false,
            okLabel: "close",
          });
        },
        false
      );

      // star
      starIcon.addEventListener(
        "click",
        () => {
          if (currentChannelId != null) {
            // In case of broadcast
            fire.updateStarData(currentChannelId);
          } else if (currentSnapshotId != null) {
            // In case of snapshot
            // Unlike broadcast, the DB is not being monitored, so reflect it with a callback
            fire
              .incrementSnapshotStarCount(currentSnapshotId)
              .then((starCount) => {
                updateStar(starCount);
              });
          }
        },
        false
      );

      // hide menu
      hideIcon.addEventListener(
        "click",
        () => {
          setLayerView(true);
        },
        false
      );

      // show menu
      showIcon.addEventListener(
        "click",
        () => {
          setLayerView(false);
        },
        false
      );

      // toggle menu
      menuIcon.addEventListener(
        "click",
        () => {
          toggleEditorView();
        },
        false
      );

      // import local sound
      noteIcon.addEventListener(
        "click",
        () => {
          execMusician();
        },
        false
      );

      // broadcast
      broadIcon.addEventListener(
        "click",
        () => {
          if (ownerURL !== "") {
            // If a broadcast URL has been generated even once, just re-display it
            const wrap = generateShareAnchor(ownerURL, friendURL, shareURL);
            showDialog(wrap, { cancelVisible: false });
            return;
          }
          showDialog("Do you want to start setting up a broadcast?")
            .then((isOk) => {
              return new Promise((resolve, reject) => {
                if (isOk === true) {
                  // Generate the broadcast form
                  broadcastForm = generateBroadcastForm();
                  const directorName =
                    broadcastForm.querySelector(".directorname");
                  setTimeout(() => {
                    directorName.focus();
                  }, 200);
                  showDialog(broadcastForm).then((isOk) => {
                    if (isOk === true) {
                      resolve();
                    } else {
                      reject("Broadcast settings were cancelled.");
                    }
                  });
                } else {
                  reject("Broadcast settings were cancelled.");
                }
              });
            })
            .then(() => {
              return new Promise((resolve, reject) => {
                // Check the input content
                broadcastSetting = {
                  validation: true,
                  assign: "both",
                };
                // Check if the screen name or group name is not empty
                const directorName =
                  broadcastForm.querySelector(".directorname");
                if (
                  directorName.value === "" ||
                  directorName.value.replace(/\s/g, "") === ""
                ) {
                  broadcastSetting.validation = false;
                }
                // Check which radio button is selected
                const both = broadcastForm.querySelector(".assignboth");
                const graphics = broadcastForm.querySelector(
                  ".assignonlygraphics"
                );
                const inviteSound =
                  broadcastForm.querySelector(".assigninvitesound");
                const sound = broadcastForm.querySelector(".assignonlysound");
                const inviteGraphics = broadcastForm.querySelector(
                  ".assigninvitegraphics"
                );
                if (both.checked === true) {
                  broadcastSetting.assign = BROADCAST_ASSIGN.BOTH;
                }
                if (graphics.checked === true) {
                  broadcastSetting.assign = BROADCAST_ASSIGN.ONLY_GRAPHICS;
                }
                if (inviteSound.checked === true) {
                  broadcastSetting.assign = BROADCAST_ASSIGN.INVITE_SOUND;
                }
                if (sound.checked === true) {
                  broadcastSetting.assign = BROADCAST_ASSIGN.ONLY_SOUND;
                }
                if (inviteGraphics.checked === true) {
                  broadcastSetting.assign = BROADCAST_ASSIGN.INVITE_GRAPHICS;
                }
                // If there are no issues with the input content, initialize various variables and perform Firebase-related initialization
                currentDirectorId = null;
                friendDirectorId = null;
                currentDirectorName = null;
                currentChannelId = null;
                broadcastForm = null;
                directionMode = null;
                friendDirectionMode = null;
                isOwner = null;
                shareURL = "";
                ownerURL = "";
                friendURL = "";
                if (broadcastSetting.validation === true) {
                  showDialog("please wait...", {
                    okDisable: true,
                    cancelDisable: true,
                  });
                  currentDirectorName = directorName.value;
                  return fire
                    .createDirector(currentDirectorName)
                    .then((res) => {
                      resolve(res);
                    });
                } else {
                  // Terminate if there are issues with the input
                  showDialog("screen name is blank.", {
                    okVisible: false,
                    cancelLabel: "ok",
                  });
                  reject("screen name is blank.");
                }
              });
            })
            .then((res) => {
              // Cache the director ID
              currentDirectorId = res.directorId;
              return new Promise((resolve) => {
                if (
                  broadcastSetting.assign === BROADCAST_ASSIGN.INVITE_SOUND ||
                  broadcastSetting.assign === BROADCAST_ASSIGN.INVITE_GRAPHICS
                ) {
                  // If delegating to someone, create another director with the same name
                  fire.createDirector(currentDirectorName).then((friendRes) => {
                    friendDirectorId = friendRes.directorId;
                    resolve();
                  });
                } else {
                  // Otherwise, resolve immediately
                  resolve();
                }
              });
            })
            .then(() => {
              // If the source has been correctly updated, set it as the initial value for the channel
              let graphicsSource = fragmenDefaultSource[currentMode];
              let soundSource = Onomat.FRAGMENT_SHADER_SOURCE_DEFAULT;
              if (latestStatus === "success") {
                graphicsSource = editor.getValue();
              }
              if (latestAudioStatus === "success") {
                soundSource = audioEditor.getValue();
              }
              // Create a channel
              return fire.createChannel(
                currentDirectorId,
                graphicsSource,
                currentMode,
                soundSource
              );
            })
            .then((res) => {
              // Cache the channel ID
              currentChannelId = res.channelId;
              // Create a star for the channel
              return fire.createStar(currentChannelId);
            })
            .then(() => {
              // Create viewers for the channel
              return fire.createViewer(currentChannelId);
            })
            .then(() => {
              // Register director information to the channel
              // friendDirectionMode is set when directionMode is not both (i.e., there is a friend)
              switch (broadcastSetting.assign) {
                case BROADCAST_ASSIGN.BOTH:
                  directionMode = BROADCAST_DIRECTION.BOTH;
                  return fire.updateChannelDirector(
                    currentChannelId,
                    currentDirectorId,
                    currentDirectorId
                  );
                case BROADCAST_ASSIGN.ONLY_GRAPHICS:
                  directionMode = BROADCAST_DIRECTION.GRAPHICS;
                  return fire.updateChannelDirector(
                    currentChannelId,
                    currentDirectorId,
                    undefined
                  );
                case BROADCAST_ASSIGN.INVITE_SOUND:
                  directionMode = BROADCAST_DIRECTION.GRAPHICS;
                  friendDirectionMode = BROADCAST_DIRECTION.SOUND;
                  audioEditor.setReadOnly(true); // Set editor to read-only as sound is being invited
                  return fire.updateChannelDirector(
                    currentChannelId,
                    currentDirectorId,
                    friendDirectorId
                  );
                case BROADCAST_ASSIGN.ONLY_SOUND:
                  directionMode = BROADCAST_DIRECTION.SOUND;
                  return fire.updateChannelDirector(
                    currentChannelId,
                    undefined,
                    currentDirectorId
                  );
                case BROADCAST_ASSIGN.INVITE_GRAPHICS:
                  directionMode = BROADCAST_DIRECTION.SOUND;
                  friendDirectionMode = BROADCAST_DIRECTION.GRAPHICS;
                  editor.setReadOnly(true); // Set editor to read-only as graphics is being invited
                  disableRegulation();
                  return fire.updateChannelDirector(
                    currentChannelId,
                    friendDirectorId,
                    currentDirectorId
                  );
              }
            })
            .then((res) => {
              // Generate a return URL for the director
              ownerURL =
                BASE_URL +
                "?" +
                generateDirectorURL(
                  currentMode,
                  directionMode,
                  broadcastSetting.assign,
                  currentDirectorId,
                  currentChannelId,
                  friendDirectorId
                );
              // Generate a URL if there is a friend
              if (friendDirectorId != null) {
                friendURL =
                  BASE_URL +
                  "?" +
                  generateFriendURL(
                    currentMode,
                    directionMode,
                    broadcastSetting.assign,
                    currentDirectorId,
                    currentChannelId,
                    friendDirectorId
                  );
                // Display the scroll sync switch as the broadcast will be received
                showSyncScrollSwitch();
                hideAuthorBlock();
                // Set read-only and register listener if there is a friend
                if (
                  directionMode === BROADCAST_DIRECTION.SOUND &&
                  friendDirectorId != null
                ) {
                  editor.setReadOnly(true);
                  // Listen to graphics
                  fire.listenChannelData(currentChannelId, (snap) => {
                    channelData = snap;
                    reflectGraphics(channelData);
                  });
                } else if (
                  directionMode === BROADCAST_DIRECTION.GRAPHICS &&
                  friendDirectorId != null
                ) {
                  audioEditor.setReadOnly(true);
                  // Listen to sound
                  fire.listenChannelData(currentChannelId, (snap) => {
                    channelData = snap;
                    reflectSound(channelData);
                    if (soundPlay !== channelData.sound.play) {
                      soundPlay = channelData.sound.play;
                      // Play if the remote play count has changed
                      if (latestAudioStatus !== "success") {
                        return;
                      }
                      updateAudio(audioEditor.getValue(), true);
                    }
                  });
                }
              }
              const params = `?ch=${currentChannelId}&dm=${directionMode}`;
              // Generate a public broadcast URL
              shareURL = `${BASE_URL}${params}`;
              // Change the omnibar (address bar) state to the same URL as the broadcast viewer
              history.replaceState("", "", params);
              // Display the star icon and set the listener
              showStarIcon();
              fire.listenStarData(currentChannelId, (snap) => {
                updateStar(snap.count);
              });
              // Display the viewer count and set the listener
              showViewerIcon();
              fire.listenViewerData(currentChannelId, (snap) => {
                updateViewer(snap.count);
              });
              // Broadcast mode
              broadcastMode = "owner";

              // Generate DOM containing links and display the dialog
              const wrap = generateShareAnchor(ownerURL, friendURL, shareURL);
              showDialog(wrap, { cancelVisible: false });
            })
            .catch((err) => {
              console.error("💣", err);
              showDialog(err || "Unknown Error", { cancelVisible: false });
            });
        },
        false
      );

      // Determine and set up whether to broadcast based on information obtained from the URL
      if (broadcastMode !== "none") {
        channelData = null;
        starData = null;
        viewerData = null;
        soundPlay = 0;
        fire
          .getChannelData(currentChannelId)
          .then((snapshot) => {
            channelData = snapshot;
            soundPlay = channelData.sound.play;
            return fire.getViewerData(currentChannelId);
          })
          .then((snapshot) => {
            viewerData = snapshot;
            return fire.getStarData(currentChannelId);
          })
          .then((snapshot) => {
            let icon = null;
            starData = snapshot;
            // Common restoration process in any case
            fragmen.mode = currentMode = channelData.graphics.mode; // Restore and set the mode
            mode.selectedIndex = currentMode; // Restore the mode in the dropdown list
            editor.setValue(channelData.graphics.source); // Restore the source in the editor
            update(channelData.graphics.source); // Update with the restored source
            counter.textContent = `${channelData.graphics.source.length}`; // Character count
            audioEditor.setValue(channelData.sound.source); // Restore the sound shader source
            audioCounter.textContent = `${channelData.sound.source.length}`; // Character count
            setTimeout(() => {
              editor.gotoLine(1);
            }, 100);
            setTimeout(() => {
              audioEditor.gotoLine(1);
            }, 100);
            editor.setReadOnly(graphicsDisable); // Set the editor to read-only
            audioEditor.setReadOnly(soundDisable); // Set the audio editor to read-only
            updateStar(starData.count); // Update the star content
            updateViewer(viewerData.count); // Update the viewer count
            showStarIcon(); // Display the star icon
            showViewerIcon(); // Display the viewer count
            fire.listenStarData(currentChannelId, (snap) => {
              // Set the listener
              starData = snap;
              updateStar(starData.count);
            });
            fire.listenViewerData(currentChannelId, (snap) => {
              // Set the listener
              viewerData = snap;
              updateViewer(viewerData.count);
            });
            // Process for each broadcast mode
            switch (broadcastMode) {
              case "owner":
                // Consider the return as the owner complete and reset the flag
                isDirectorInitialized = true;
                // Broadcast set up by oneself
                if (
                  directionMode === BROADCAST_DIRECTION.BOTH ||
                  directionMode === BROADCAST_DIRECTION.SOUND
                ) {
                  // If sound is needed, display a custom dialog and prompt for a click operation
                  showDialog("Sound playback is enabled on this channel.", {
                    cancelVisible: false,
                  }).then(() => {
                    // Initialize onomat
                    audioToggle.checked = true;
                    onomatSetting(false);
                  });
                }
                if (
                  directionMode === BROADCAST_DIRECTION.SOUND &&
                  friendDirectorId != null
                ) {
                  // Display the sync scroll switch as partial broadcast will be received
                  showSyncScrollSwitch();
                  hideAuthorBlock();
                  // Listen to graphics
                  fire.listenChannelData(currentChannelId, (snap) => {
                    channelData = snap;
                    reflectGraphics(channelData);
                  });
                } else if (
                  directionMode === BROADCAST_DIRECTION.GRAPHICS &&
                  friendDirectorId != null
                ) {
                  // Display the sync scroll switch as partial broadcast will be received
                  showSyncScrollSwitch();
                  hideAuthorBlock();
                  // Listen to sound
                  fire.listenChannelData(currentChannelId, (snap) => {
                    channelData = snap;
                    reflectSound(channelData);
                    if (soundPlay !== channelData.sound.play) {
                      soundPlay = channelData.sound.play;
                      // Play if the remote playback count has changed
                      if (latestAudioStatus !== "success") {
                        return;
                      }
                      updateAudio(audioEditor.getValue(), true);
                    }
                  });
                }
                break;
              case "friend":
                // Display the sync scroll switch as broadcast will be received
                showSyncScrollSwitch();
                hideAuthorBlock();
                // Consider the return as the friend complete and reset the flag
                isDirectorInitialized = true;
                // Sound may play as it is set to friend
                showDialog("Sound playback is enabled on this channel.", {
                  cancelVisible: false,
                }).then(() => {
                  // Initialize onomat
                  audioToggle.checked = true;
                  onomatSetting(false);
                });
                if (directionMode === BROADCAST_DIRECTION.SOUND) {
                  // Listen to sound
                  fire.listenChannelData(currentChannelId, (snap) => {
                    channelData = snap;
                    reflectSound(channelData);
                    if (soundPlay !== channelData.sound.play) {
                      soundPlay = channelData.sound.play;
                      // Play if the remote playback count has changed
                      if (latestAudioStatus !== "success") {
                        return;
                      }
                      updateAudio(audioEditor.getValue(), true);
                    }
                  });
                } else if (directionMode === BROADCAST_DIRECTION.GRAPHICS) {
                  // Listen to graphics
                  fire.listenChannelData(currentChannelId, (snap) => {
                    channelData = snap;
                    reflectGraphics(channelData);
                  });
                }
                // Do not display the broadcast icon on the friend side
                icon = document.querySelector("#broadcasticon");
                icon.classList.add("nevershow");
                break;
              case "audience":
                if (channelData.disc !== "unknown") {
                  // Check if the viewing user has allowed sound playback
                  let soundEnable = false;
                  // If disc is not unknown, sound may be updated
                  showDialog(
                    "This channel is a valid sound shader.\nIs it OK to play the audio?",
                    {
                      okLabel: "yes",
                      cancelLabel: "no",
                    }
                  ).then((result) => {
                    soundEnable = result;
                    // Pass a flag indicating whether the user clicked OK or Cancel
                    audioToggle.checked = true;
                    onomatSetting(result);
                    audioCounter.textContent = `${
                      audioEditor.getValue().length
                    }`;
                  });
                  // Set listener
                  fire.listenChannelData(currentChannelId, (snap) => {
                    channelData = snap;
                    reflectGraphics(channelData);
                    reflectSound(channelData);
                    if (
                      soundEnable === true &&
                      soundPlay !== channelData.sound.play
                    ) {
                      soundPlay = channelData.sound.play;
                      // Play if the user has allowed it & the remote playback count has changed
                      if (
                        audioToggle.checked !== true ||
                        latestAudioStatus !== "success"
                      ) {
                        return;
                      }
                      updateAudio(audioEditor.getValue(), true);
                    }
                  });
                } else {
                  // Set listener for non-sound
                  fire.listenChannelData(currentChannelId, (snap) => {
                    channelData = snap;
                    reflectGraphics(channelData);
                  });
                  // Hide the editor area if there is no sound shader broadcast
                  audioToggle.checked = false;
                  audioWrap.classList.add("invisible");
                  audioPlayIcon.classList.add("disabled");
                  audioStopIcon.classList.add("disabled");
                }
                // Do not display the broadcast icon on the viewer side
                icon = document.querySelector("#broadcasticon");
                icon.classList.add("nevershow");
                // Change the state of the menu on the viewer side
                fire.getDirectorData(channelData.directorId).then((snap) => {
                  hideMenu(snap.name);
                });
                // Increment the viewer count
                fire.updateViewerData(currentChannelId);
                // Set up the settings for when the user leaves
                window.addEventListener(
                  "beforeunload",
                  (evt) => {
                    evt.preventDefault();
                    evt.returnValue = "";
                    fire.updateViewerData(currentChannelId, false);
                    // There is no way to know which option the user chose...
                    // So, if this window instance is still open after 1 minute,
                    // consider the viewing to be continued and increment the count
                    setTimeout(() => {
                      fire.updateViewerData(currentChannelId);
                    }, 60000);
                  },
                  false
                );
                // Display the sync scroll switch as the broadcast will be received
                // Note: There is enough margin even if the Author block is not hidden, so do not hide it
                showSyncScrollSwitch();
                break;
            }
          })
          .catch((err) => {
            console.error("💣", err);
            showDialog("Firebase Error", { cancelVisible: false });
          });
      }

      // If a snapshot ID is found, attempt to load the snapshot
      if (currentSnapshotId != null) {
        fire.getSnapshot(currentSnapshotId).then((snapshot) => {
          fragmen.mode = currentMode = snapshot.graphics.mode; // Restore and set the mode
          mode.selectedIndex = currentMode; // Restore the mode in the dropdown list
          disableAttachEvent = true; // Do not set beforeunload when restoring on the editor
          editor.setValue(snapshot.graphics.source); // Restore the source on the editor
          update(snapshot.graphics.source); // Update with the restored source
          counter.textContent = `${snapshot.graphics.source.length}`; // Character count
          setTimeout(() => {
            editor.gotoLine(1);
          }, 100);

          if (snapshot.sound != null) {
            audioToggle.checked = true;

            audioEditor.setValue(snapshot.sound.source); // Restore the sound shader source
            updateAudio(snapshot.sound.source, true); // Update with the restored source
            audioCounter.textContent = `${snapshot.sound.source.length}`; // Character count
            setTimeout(() => {
              audioEditor.gotoLine(1);
            }, 100);

            // First, show a custom dialog and let the user click
            showDialog(
              "This URL is a valid sound shader.\nIs it OK to play the audio?",
              {
                okLabel: "yes",
                cancelLabel: "no",
              }
            ).then((result) => {
              // Pass a flag indicating whether the user clicked OK or Cancel
              onomatSetting(result);
            });
          }

          setSnapshotDate(snapshot.date); // Display the posting date
          updateStar(snapshot.starCount); // Update the star content
          updateViewer(snapshot.viewCount + 1); // Update the viewer count, pre-incremented by 1
          showStarIcon(); // Display the star icon
          showViewerIcon(); // Display the viewer count icon

          fire.incrementSnapshotViewCount(currentSnapshotId);
        });
      }

      // If the menu and editor are hidden (note that this is different from fullscreen)
      if (isLayerHidden === true) {
        setLayerView(true);
      }
    },
    false
  );

  /**
   * Window resize handler
   */
  function resize() {
    const canvas = document.querySelector("#webgl");
    const bound = canvas.parentElement.getBoundingClientRect();
    canvas.width = bound.width;
    canvas.height = bound.height;
  }

  /**
   * Change layer view
   *
   * Passing `true` hides the editor and makes the shader run in full screen.
   * Passing `false` reverts this state.
   */
  function setLayerView(value) {
    if (value) {
      wrap.classList.add("hide");
    } else {
      wrap.classList.remove("hide");
    }

    editor.resize();
    audioEditor.resize();
    resize();
    fragmen.rect();
  }

  /**
   * Change editor view
   */
  function toggleEditorView() {
    wrap.classList.toggle("overlay");

    editor.resize();
    audioEditor.resize();
    resize();
    fragmen.rect();
  }

  /**
   * Load and play a local audio file
   */
  function execMusician() {
    if (musician == null) {
      musician = new Musician();
    }
    musician.loadFile().then(() => {
      musician.play();
    });
  }

  /**
   * Update shader source
   */
  function update(source) {
    if (fragmen == null) {
      return;
    }
    fragmen.render(source);
  }

  /**
   * Update shader source with audio
   */
  function updateAudio(source, force) {
    if (onomat == null) {
      return;
    }
    onomat.render(source, force);
  }

  /**
   * Reflect the state on the graphics side based on updates
   * @param {object} data - Update data
   */
  function reflectGraphics(data) {
    fragmen.mode = currentMode = mode.selectedIndex = data.graphics.mode;
    const numbers = data.graphics.cursor.split("|");
    if (editor.getValue() !== data.graphics.source) {
      editor.setValue(data.graphics.source);
    }
    if (syncScroll === true) {
      editor.gotoLine(parseInt(numbers[0]) + 1, parseInt(numbers[1]), true);
      editor.session.setScrollTop(parseInt(numbers[2]));
    } else {
      editor.clearSelection();
    }
  }

  /**
   * Reflect the state on the sound side based on updates
   * @param {object} data - Update data
   */
  function reflectSound(data) {
    const numbers = data.sound.cursor.split("|");
    if (audioEditor.getValue() !== data.sound.source) {
      audioEditor.setValue(data.sound.source);
    }
    if (syncScroll === true) {
      audioEditor.gotoLine(
        parseInt(numbers[0]) + 1,
        parseInt(numbers[1]),
        true
      );
      audioEditor.session.setScrollTop(parseInt(numbers[2]));
    } else {
      audioEditor.clearSelection();
    }
  }

  /**
   * Initial settings for Ace editor
   * @param {string} id - ID attribute of the target DOM
   * @param {string} source - Source code to set as the initial value
   * @param {function} onChange - Callback for change event
   * @param {function} onSelectionChange - Callback for selection change event
   * @param {string} [theme='chaos'] - Theme
   */
  function editorSetting(
    id,
    source,
    onChange,
    onSelectionChange,
    theme = "chaos"
  ) {
    const edit = ace.edit(id);
    edit.setTheme(`ace/theme/${theme}`);
    edit.session.setOption("indentedSoftWrap", false);
    edit.session.setUseWrapMode(true);
    edit.session.setMode("ace/mode/glsl");
    edit.session.setTabSize(2);
    edit.session.setUseSoftTabs(true);
    edit.$blockScrolling = Infinity;
    edit.setShowPrintMargin(false);
    edit.setShowInvisibles(true);
    edit.setHighlightSelectedWord(true);
    edit.setValue(source);

    // Set listener for when the content of the editor changes
    edit.session.on("change", onChange);

    // Set listener for when the selection within the editor changes
    edit.selection.on("changeSelection", onSelectionChange);

    // Focus on the first line
    setTimeout(() => {
      edit.gotoLine(1);
    }, 100);
    return edit;
  }

  /**
   * Capture GIF
   * @param {number} [frame=180] - Number of frames to capture
   * @param {number} [width=512] - Width of the canvas to capture
   * @param {number} [height=256] - Height of the canvas to capture
   * @param {string} [format='gif'] - Capture output format
   * @param {number} [framerate=60] - Capture framerate
   * @param {number} [quality=100] - Capture quality
   * @param {number} [offset=0.0] - Offset base time
   */
  function captureAnimation(
    frame = 180,
    width = 512,
    height = 256,
    format = "gif",
    framerate = 60,
    quality = 100,
    offset = 0.0
  ) {
    // Initialize CCapture
    const ccapture = new CCapture({
      verbose: false,
      format: format,
      workersPath: "./js/",
      framerate: framerate,
      quality: quality,
      onProgress: (range) => {
        // Output conversion progress
        const p = Math.floor(range * 100);
        download.textContent = `${p}%`;
      },
    });

    // Create and configure canvas for capture
    let captureCanvas = document.createElement("canvas");
    // Must exist on the document to avoid WebGL initialization failure
    captureCanvas.width = width;
    captureCanvas.height = height;
    captureCanvas.style.position = "absolute";
    captureCanvas.style.top = "-9999px";
    captureCanvas.style.left = "-9999px";
    document.body.appendChild(captureCanvas);
    const option = Object.assign(FRAGMEN_OPTION, {
      target: captureCanvas,
      eventTarget: captureCanvas,
      offsetTime: offset,
    });
    // Create a new instance of fragmen with the same mode
    let frag = new Fragmen(option);
    frag.mode = currentMode;
    // Render for the specified number of frames and generate GIF
    let frameCount = 0;
    frag.onDraw(() => {
      if (frameCount < frame) {
        ccapture.capture(captureCanvas);
      } else {
        frag.run = false;
        ccapture.stop();
        ccapture.save((blob) => {
          setTimeout(() => {
            // Generate a download link from the blob
            const url = URL.createObjectURL(blob);
            let anchor = document.createElement("a");
            document.body.appendChild(anchor);
            anchor.download = `${uuid()}.${format}`;
            anchor.href = url;
            anchor.click();
            document.body.removeChild(anchor);
            document.body.removeChild(captureCanvas);
            // Clean up and restore the UI
            URL.revokeObjectURL(url);
            download.classList.remove("disabled");
            download.textContent = "Download";
            isEncoding = false;
            captureCanvas = null;
            frag = null;
            anchor = null;
          }, 500);
        });
      }
      ++frameCount;
    });
    ccapture.start();
    frag.render(editor.getValue());
  }

  /**
   * Capture a still image at a specified time
   * @param {number} [time=0] - capture time
   * @param {number} [width=512] - width of the canvas for capture
   * @param {number} [height=256] - height of the canvas for capture
   * @param {string} [format='jpg'] - capture output format
   */
  function captureImage(time = 0, width = 512, height = 256, format = "jpg") {
    // Create and configure canvas for capture
    let captureCanvas = document.createElement("canvas");
    // Must exist on the document to avoid WebGL initialization failure
    captureCanvas.width = width;
    captureCanvas.height = height;
    captureCanvas.style.position = "absolute";
    captureCanvas.style.top = "-9999px";
    captureCanvas.style.left = "-9999px";
    document.body.appendChild(captureCanvas);
    const option = Object.assign(FRAGMEN_OPTION, {
      target: captureCanvas,
      eventTarget: captureCanvas,
    });
    // Create a new instance of Fragmen with the specified mode
    let frag = new Fragmen(option);
    frag.mode = currentMode;
    frag.onDraw(() => {
      frag.run = false;
      // Generate a download link from the blob
      const formatName = format === "jpg" ? "jpeg" : format;
      const url = captureCanvas.toDataURL(`image/${formatName}`);
      let anchor = document.createElement("a");
      document.body.appendChild(anchor);
      anchor.download = `${uuid()}.${format}`;
      anchor.href = url;
      anchor.click();
      document.body.removeChild(anchor);
      document.body.removeChild(captureCanvas);
      // Clean up and restore the UI
      download.classList.remove("disabled");
      download.textContent = "Download";
      isEncoding = false;
      captureCanvas = null;
      frag = null;
      anchor = null;
    });
    frag.render(editor.getValue(), time);
  }

  /**
   * Toggle the visibility of the editor based on the state of audioToggle, and initialize Onomat if necessary
   * @param {boolean} [play=true] - Flag indicating whether to start playback immediately
   */
  function onomatSetting(play = true) {
    // Check if an instance of onomat already exists
    if (onomat == null) {
      // Try to create one if it doesn't exist
      onomat = new Onomat();
      // Register the build event
      onomat.on("build", (res) => {
        latestAudioStatus = res.status;
        audioLineout.classList.remove("warn");
        audioLineout.classList.remove("error");
        audioLineout.classList.add(res.status);
        audioMessage.textContent = res.message;
        if (latestStatus === "success" && latestAudioStatus === "success") {
          link.classList.remove("disabled");
        } else {
          link.classList.add("disabled");
        }
        // Send the status regardless of the status during broadcasting
        if (
          currentChannelId != null &&
          (broadcastMode === "owner" || broadcastMode === "friend")
        ) {
          // Check if the user is in a position to edit graphics
          if (
            (broadcastMode === "owner" &&
              directionMode !== BROADCAST_DIRECTION.GRAPHICS) ||
            (broadcastMode === "friend" &&
              directionMode === BROADCAST_DIRECTION.GRAPHICS)
          ) {
            updateSoundData(currentDirectorId, currentChannelId, soundPlay);
          }
        }
      });
      // Register playback processing with a timer if specified by the argument
      if (play === true) {
        setTimeout(() => {
          updateAudio(audioEditor.getValue(), true);
        }, 500);
      }
    }
    // Toggle visibility
    if (audioToggle.checked === true) {
      audioWrap.classList.remove("invisible");
      audioPlayIcon.classList.remove("disabled");
      audioStopIcon.classList.remove("disabled");
    } else {
      audioWrap.classList.add("invisible");
      audioPlayIcon.classList.add("disabled");
      audioStopIcon.classList.add("disabled");
    }
    // Call resize to prevent editor scroll issues
    editor.resize();
    audioEditor.resize();
  }

  /**
   * Generate components for the broadcast form
   * @return {HTMLDivElement}
   */
  function generateBroadcastForm() {
    const wrap = document.createElement("div");

    const directorNameHeader = document.createElement("h3");
    directorNameHeader.textContent = "screen name";
    const directorNameInput = document.createElement("input");
    directorNameInput.classList.add("directorname"); // screen name
    directorNameInput.setAttribute("type", "text");
    directorNameInput.setAttribute(
      "placeholder",
      "your screen name or group name"
    );
    wrap.appendChild(directorNameHeader);
    wrap.appendChild(directorNameInput);

    const assignHeader = document.createElement("h3");
    assignHeader.textContent = "assign setting";
    const assignCaption = document.createElement("div");
    assignCaption.textContent = "How do you assign them?";
    wrap.appendChild(assignHeader);
    wrap.appendChild(assignCaption);

    const assignLabelBoth = document.createElement("label");
    const assignCaptionBoth = document.createElement("span");
    assignCaptionBoth.textContent = "both (graphics, sound)";
    const assignInputBoth = document.createElement("input");
    assignInputBoth.classList.add("assignboth"); // both
    assignInputBoth.setAttribute("type", "radio");
    assignInputBoth.setAttribute("name", "assignment");
    assignInputBoth.checked = true;
    wrap.appendChild(assignLabelBoth);
    assignLabelBoth.appendChild(assignInputBoth);
    assignLabelBoth.appendChild(assignCaptionBoth);

    const assignLabelGraphicsOnly = document.createElement("label");
    const assignCaptionGraphicsOnly = document.createElement("span");
    assignCaptionGraphicsOnly.textContent = "only graphics";
    const assignInputGraphicsOnly = document.createElement("input");
    assignInputGraphicsOnly.classList.add("assignonlygraphics"); // only graphics
    assignInputGraphicsOnly.setAttribute("type", "radio");
    assignInputGraphicsOnly.setAttribute("name", "assignment");
    wrap.appendChild(assignLabelGraphicsOnly);
    assignLabelGraphicsOnly.appendChild(assignInputGraphicsOnly);
    assignLabelGraphicsOnly.appendChild(assignCaptionGraphicsOnly);

    const assignLabelSoundToFriend = document.createElement("label");
    const assignCaptionSoundToFriend = document.createElement("span");
    assignCaptionSoundToFriend.textContent =
      "graphics, and invite friend to sound";
    const assignInputSoundToFriend = document.createElement("input");
    assignInputSoundToFriend.classList.add("assigninvitesound"); // sound to friend
    assignInputSoundToFriend.setAttribute("type", "radio");
    assignInputSoundToFriend.setAttribute("name", "assignment");
    wrap.appendChild(assignLabelSoundToFriend);
    assignLabelSoundToFriend.appendChild(assignInputSoundToFriend);
    assignLabelSoundToFriend.appendChild(assignCaptionSoundToFriend);

    const assignLabelSoundOnly = document.createElement("label");
    const assignCaptionSoundOnly = document.createElement("span");
    assignCaptionSoundOnly.textContent = "only sound";
    const assignInputSoundOnly = document.createElement("input");
    assignInputSoundOnly.classList.add("assignonlysound"); // only sound
    assignInputSoundOnly.setAttribute("type", "radio");
    assignInputSoundOnly.setAttribute("name", "assignment");
    wrap.appendChild(assignLabelSoundOnly);
    assignLabelSoundOnly.appendChild(assignInputSoundOnly);
    assignLabelSoundOnly.appendChild(assignCaptionSoundOnly);

    const assignLabelGraphicsToFriend = document.createElement("label");
    const assignCaptionGraphicsToFriend = document.createElement("span");
    assignCaptionGraphicsToFriend.textContent =
      "sound, and invite friend to graphics";
    const assignInputGraphicsToFriend = document.createElement("input");
    assignInputGraphicsToFriend.classList.add("assigninvitegraphics"); // graphics to friend
    assignInputGraphicsToFriend.setAttribute("type", "radio");
    assignInputGraphicsToFriend.setAttribute("name", "assignment");
    wrap.appendChild(assignLabelGraphicsToFriend);
    assignLabelGraphicsToFriend.appendChild(assignInputGraphicsToFriend);
    assignLabelGraphicsToFriend.appendChild(assignCaptionGraphicsToFriend);

    return wrap;
  }

  /**
   * Generates components for the broadcast form
   * @return {HTMLDivElement}
   */
  function generateShareAnchor(ownerURL, friendURL, shareURL) {
    const wrap = document.createElement("div");
    const directorHeader = document.createElement("h3");
    directorHeader.textContent = "Director (You)";
    const directorCaption = document.createElement("div");
    directorCaption.textContent =
      "The URL to return to a state where you can edit this channel again.";
    const directorAnchor = document.createElement("a");
    directorAnchor.textContent = "Director URL";
    directorAnchor.setAttribute("href", ownerURL);
    wrap.appendChild(directorHeader);
    wrap.appendChild(directorCaption);
    wrap.appendChild(directorAnchor);
    if (friendURL != null && friendURL !== "") {
      const friendHeader = document.createElement("h3");
      friendHeader.textContent = "Co-Editor (Friend)";
      const friendCaption = document.createElement("div");
      friendCaption.textContent =
        "Only share it with friends who are co-editors.";
      const friendAnchor = document.createElement("a");
      friendAnchor.textContent = "Friend URL";
      friendAnchor.setAttribute("href", friendURL);
      wrap.appendChild(friendHeader);
      wrap.appendChild(friendCaption);
      wrap.appendChild(friendAnchor);
    }
    const publicHeader = document.createElement("h3");
    publicHeader.textContent = "Audience";
    const publicCaption = document.createElement("div");
    publicCaption.textContent = "This is a URL for public broadcast.";
    const publicAnchor = document.createElement("a");
    publicAnchor.textContent = "Broadcast URL";
    publicAnchor.setAttribute("href", shareURL);
    wrap.appendChild(publicHeader);
    wrap.appendChild(publicCaption);
    wrap.appendChild(publicAnchor);

    return wrap;
  }

  /**
   * Retrieve searchParams
   * @return {URLSearchParams}
   */
  function getParameter() {
    return new URL(document.location).searchParams;
  }

  /**
   * Create a snapshot and generate a URL
   *
   * @returns {Promise<string>} - The snapshot URL
   */
  async function generateSnapshotLink() {
    const graphicsSource = editor.getValue();
    const graphicsMode = parseInt(mode.value);

    let soundSource = undefined;
    if (audioToggle.checked && latestAudioStatus === "success") {
      soundSource = audioEditor.getValue();
    }

    currentSnapshotId = await fire.createSnapshot(
      graphicsSource,
      graphicsMode,
      soundSource
    );
    const snapshotUrl = `${BASE_URL}?ol=true&ss=${currentSnapshotId}`;
    return snapshotUrl;
  }

  /**
   * Generate a complete director URL that allows the owner director to return
   * @param {number} graphicsMode - The current graphics mode
   * @param {string} directionMode - The direction mode included in BROADCAST_DIRECTION
   * @param {string} assign - The assignment setting included in BROADCAST_ASSIGN
   * @param {string} directorId - The director ID
   * @param {string} channelId - The channel ID
   * @param {string} friendId - The director ID set for the friend
   * @return {string}
   */
  function generateDirectorURL(
    graphicsMode,
    directionMode,
    assign,
    directorId,
    channelId,
    friendId
  ) {
    const currentState = [
      `mode=${graphicsMode}`,
      `dm=${directionMode}`,
      `ch=${channelId}`,
      `ow=true`,
    ];
    switch (assign) {
      case BROADCAST_ASSIGN.BOTH:
      case BROADCAST_ASSIGN.ONLY_GRAPHICS:
        currentState.push(`gd=${directorId}`);
        break;
      case BROADCAST_ASSIGN.INVITE_SOUND:
        currentState.push(`gd=${directorId}`, `fd=${friendId}`);
        break;
      case BROADCAST_ASSIGN.ONLY_SOUND:
        currentState.push(`sd=${directorId}`);
        break;
      case BROADCAST_ASSIGN.INVITE_GRAPHICS:
        currentState.push(`sd=${directorId}`, `fd=${friendId}`);
        break;
    }
    return currentState.join("&");
  }

  /**
   * Generate a URL to share from the owner director to a friend
   * @param {number} graphicsMode - The current graphics mode
   * @param {string} directionMode - The direction mode included in BROADCAST_DIRECTION
   * @param {string} assign - The assignment setting included in BROADCAST_ASSIGN
   * @param {string} directorId - The director ID
   * @param {string} channelId - The channel ID
   * @param {string} friendId - The director ID set for the friend
   * @return {string}
   */
  function generateFriendURL(
    graphicsMode,
    directionMode,
    assign,
    directorId,
    channelId,
    friendId
  ) {
    const currentState = [
      `mode=${graphicsMode}`,
      `dm=${directionMode}`,
      `ch=${channelId}`,
      `ow=false`,
    ];
    // The fd parameter on the friend side becomes the owner director of the channel
    switch (assign) {
      case BROADCAST_ASSIGN.INVITE_SOUND:
        currentState.push(`sd=${friendId}`, `fd=${directorId}`);
        break;
      case BROADCAST_ASSIGN.INVITE_GRAPHICS:
        currentState.push(`gd=${friendId}`, `fd=${directorId}`);
        break;
      default:
        return "";
    }
    return currentState.join("&");
  }

  /**
   * A series of processes for sending graphics data
   * @param {string} directorId - The director ID
   * @param {string} channelId - The channel ID
   * @param {number} mode - The current mode
   */
  function updateGraphicsData(directorId, channelId, mode) {
    // Do not send to remote if initialization as a director is not complete
    if (isDirectorInitialized !== true) {
      return;
    }
    // Cursor position and scroll position
    const cursor = editor.selection.getCursor();
    const scrollTop = editor.session.getScrollTop();
    const graphicsData = {
      cursor: `${cursor.row}|${cursor.column}|${scrollTop}`,
      source: editor.getValue(),
      mode: mode,
    };
    fire.updateChannelData(directorId, channelId, graphicsData);
  }

  /**
   * A series of processes for sending sound data
   * @param {string} directorId - Director ID
   * @param {string} channelId - Channel ID
   * @param {number} play - Number of times the sound is played
   */
  function updateSoundData(directorId, channelId, play) {
    // Do not send to remote if initialization as a director is not complete
    if (isDirectorInitialized !== true) {
      return;
    }
    // Cursor position and scroll position
    const cursor = audioEditor.selection.getCursor();
    const scrollTop = audioEditor.session.getScrollTop();
    const soundData = {
      cursor: `${cursor.row}|${cursor.column}|${scrollTop}`,
      source: audioEditor.getValue(),
      play: play,
    };
    fire.updateChannelData(directorId, channelId, null, soundData);
  }

  /**
   * Display the star icon
   */
  function showStarIcon() {
    const wrap = document.querySelector("#stariconwrap");
    wrap.classList.add("visible");
  }

  /**
   * Display the viewer icon
   */
  function showViewerIcon() {
    const wrap = document.querySelector("#eyeiconwrap");
    wrap.classList.add("visible");
  }

  /**
   * Display the scroll sync switch
   */
  function showSyncScrollSwitch() {
    const sync = document.querySelector("#syncscrollblock");
    sync.classList.remove("invisible");
  }

  /**
   * Hide the star icon
   */
  function hideStarIcon() {
    const wrap = document.querySelector("#stariconwrap");
    if (wrap) {
      wrap.classList.remove("visible");
    }
  }

  /**
   * Hide the viewer icon
   */
  function hideViewerIcon() {
    const wrap = document.querySelector("#eyeiconwrap");
    if (wrap) {
      wrap.classList.remove("visible");
    }
  }

  /**
   * Hide the author block
   */
  function hideAuthorBlock() {
    const author = document.querySelector("#authorblock");
    if (author) {
      author.classList.add("invisible");
    }
  }

  /**
   * Update the star count
   * @param {number} count - Count
   */
  function updateStar(count) {
    const counter = document.querySelector("#starcounter");
    const overlay = document.querySelector("#staroverlay");
    overlay.classList.remove("popup");
    overlay.classList.add("visible");
    // Cancel the timer if it is already registered
    if (starCounterTimer != null) {
      clearTimeout(starCounterTimer);
      counter.textContent = overlay.textContent = zeroPadding(count, 3);
    }
    starCounterTimer = setTimeout(() => {
      counter.textContent = overlay.textContent = zeroPadding(count, 3);
      overlay.classList.add("popup");
    }, 100);
  }

  /**
   * Update the viewer count
   * @param {number} count - Count
   */
  function updateViewer(count) {
    const counter = document.querySelector("#eyecounter");
    const overlay = document.querySelector("#eyeoverlay");
    overlay.classList.remove("popup");
    overlay.classList.add("visible");
    const clamp = Math.max(count, 0);
    // Cancel the timer if it is already registered
    if (viewerCounterTimer != null) {
      clearTimeout(viewerCounterTimer);
      counter.textContent = overlay.textContent = zeroPadding(clamp, 3);
    }
    viewerCounterTimer = setTimeout(() => {
      counter.textContent = overlay.textContent = zeroPadding(clamp, 3);
      overlay.classList.add("popup");
    }, 100);
  }

  /**
   * Display the snapshot posting date
   */
  function setSnapshotDate(unixtime) {
    const snapshotdate = document.querySelector("#snapshotdate");
    snapshotdate.classList.add("visible");

    const date = new Date(1000 * unixtime);
    snapshotdate.textContent = date.toLocaleString();
  }

  /**
   * Hide the snapshot posting date
   */
  function clearSnapshotDate() {
    const snapshotdate = document.querySelector("#snapshotdate");
    snapshotdate.classList.remove("visible");
  }

  /**
   * Pad a number with zeros
   * @param {number} number - The number to pad
   * @param {number} count - The number of digits
   * @return {string}
   */
  function zeroPadding(number, count) {
    const len = "" + number;
    return (new Array(count).join("0") + number).substr(
      -Math.max(count, len.length)
    );
  }

  /**
   * Change the state of the menu
   * @param {string} directorName - The name of the director
   */
  function hideMenu(directorName) {
    const broadcastBlock = document.querySelector("#broadcastblock");
    broadcastBlock.classList.remove("invisible");
    const broadcastCaption = broadcastBlock.querySelector(".menublockinner");
    broadcastCaption.textContent = directorName;
    const soundBlock = document.querySelector("#soundblock");
    soundBlock.classList.add("invisible");
    const exportBlock = document.querySelector("#exportblock");
    exportBlock.classList.add("invisible");
    disableRegulation();
  }

  /**
   * Set the mode selection dropdown list to disabled
   */
  function disableRegulation() {
    const select = document.querySelector("#modeselect");
    select.disabled = true;
  }

  /**
   * Display a custom dialog
   * @param {string|HTMLElement} message - The message string or DOM to append
   * @param {object}
   * @property {string} [okLabel='ok'] - The label for the ok button
   * @property {string} [cancelLabel='cancel'] - The label for the cancel button
   * @property {boolean} [okVisible=true] - Whether to display the ok button
   * @property {boolean} [cancelVisible=true] - Whether to display the cancel button
   * @property {boolean} [okDisable=false] - Whether to set the ok button to disabled
   * @property {boolean} [cancelDisable=false] - Whether to set the cancel button to disabled
   * @return {Promise} - A Promise that resolves when either the ok or cancel button is pressed
   */
  function showDialog(message, option) {
    // Set up event listeners for each button in the dialog and remove them when the button is pressed
    const dialogOption = Object.assign(
      {
        okLabel: "ok",
        cancelLabel: "cancel",
        okVisible: true,
        cancelVisible: true,
        okDisable: false,
        cancelDisable: false,
      },
      option
    );
    return new Promise((resolve) => {
      // Set the message on the dialog and display the layer
      while (dialog.firstChild != null) {
        dialog.removeChild(dialog.firstChild);
      }
      // Branch depending on whether it's a string or a DOM element
      if (message instanceof HTMLElement === true) {
        dialog.appendChild(message);
      } else {
        const sentence = message.split("\n");
        sentence.forEach((s) => {
          const div = document.createElement("div");
          div.textContent = s;
          dialog.appendChild(div);
        });
      }
      const ok = document.querySelector("#dialogbuttonok");
      const cancel = document.querySelector("#dialogbuttoncancel");
      // Set the labels to be displayed
      ok.textContent = dialogOption.okLabel;
      cancel.textContent = dialogOption.cancelLabel;
      // Set whether to make them visible
      if (dialogOption.okVisible === true) {
        ok.classList.remove("invisible");
      } else {
        ok.classList.add("invisible");
      }
      if (dialogOption.cancelVisible === true) {
        cancel.classList.remove("invisible");
      } else {
        cancel.classList.add("invisible");
      }
      // Set whether they are disabled and add events
      if (dialogOption.okDisable === true) {
        ok.classList.add("disabled");
      } else {
        ok.classList.remove("disabled");
        const okClick = () => {
          ok.removeEventListener("click", okClick);
          resolve(true);
          hideDialog();
        };
        ok.addEventListener("click", okClick, false);
      }
      if (dialogOption.cancelDisable === true) {
        cancel.classList.add("disabled");
      } else {
        cancel.classList.remove("disabled");
        const cancelClick = () => {
          cancel.removeEventListener("click", cancelClick);
          resolve(false);
          hideDialog();
        };
        cancel.addEventListener("click", cancelClick, false);
      }

      setLayerVisible(true);
    });
  }

  /**
   * Hide the dialog (and layer)
   */
  function hideDialog() {
    setLayerVisible(false);
  }

  /**
   * Set the visibility state of the floating layer
   * @param {boolean} visible - Flag indicating whether to display
   */
  function setLayerVisible(visible) {
    if (visible === true) {
      layer.classList.add("visible");
    } else {
      layer.classList.remove("visible");
    }
  }

  /**
   * Exit fullscreen (without DOM manipulation)
   */
  function exitFullscreen() {
    if (
      document.fullscreenEnabled !== true &&
      document.webkitFullscreenEnabled !== true
    ) {
      return;
    }
    // Directly call without caching to avoid Illegal invocation
    if (document.exitFullscreen != null) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen != null) {
      document.webkitExitFullscreen();
    }
  }

  /**
   * Perform DOM manipulation and resize editor area after exiting fullscreen
   */
  function exitFullscreenMode() {
    wrap.classList.remove("fullscreen");

    if (unregisterCursorTimeout != null) {
      unregisterCursorTimeout();
    }

    editor.resize();
    audioEditor.resize();
    resize();
    fragmen.rect();
  }

  /**
   * Transition to fullscreen mode and resize editor area
   */
  function requestFullscreenMode() {
    if (
      document.fullscreenEnabled !== true &&
      document.webkitFullscreenEnabled !== true
    ) {
      return;
    }
    // Directly call without caching to avoid Illegal invocation
    if (document.body.requestFullscreen != null) {
      document.body.requestFullscreen();
    } else if (document.body.webkitRequestFullScreen != null) {
      document.body.webkitRequestFullScreen();
    }

    wrap.classList.add("fullscreen");
    unregisterCursorTimeout = registerCursorTimeout(wrap);

    editor.resize();
    audioEditor.resize();
    resize();
    fragmen.rect();
  }

  /**
   * Copies the given string to the clipboard
   * @param {string} str - The string to be copied
   */
  function copyToClipboard(str) {
    // Create a textarea, set its value, select the text, and issue the copy command
    const t = document.createElement("textarea");
    t.value = str;
    document.body.appendChild(t);
    t.select();
    document.execCommand("copy");
    // Remove the textarea from the body
    document.body.removeChild(t);
  }

  /**
   * Generates a UUID
   * @return {string}
   */
  function uuid() {
    // https://github.com/GoogleChrome/chrome-platform-analytics/blob/master/src/internal/identifier.js
    const chars = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".split("");
    for (let i = 0, j = chars.length; i < j; i++) {
      switch (chars[i]) {
        case "x":
          chars[i] = Math.floor(Math.random() * 16).toString(16);
          break;
        case "y":
          chars[i] = (Math.floor(Math.random() * 4) + 8).toString(16);
          break;
      }
    }
    return chars.join("");
  }
})();
