import React, { useEffect, useRef, useState } from "react";
import { Fragmen } from "@/public/js/fragmen.js";
import { CommandParams } from "..";
export { default as handleShader } from "./handle";

const ModeSelect = ({ onModeChange, defaultMode }) => {
  return (
    <div>
      <h3
        title="classic: An ordinary shader editor.
geek: Uniform variables become a single character.
geeker: geek mode + you don't have to define precision and uniform variables by yourself.
geekest: geeker mode + 'void main(){}' can be omitted, 'gl_FragCoord' can be described as 'FC'. In addition, a variety of GLSL snippets are available."
      >
        Regulation
      </h3>
      <div>
        <select id="modeselect" onChange={onModeChange} value={defaultMode}>
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
  );
};

export type ShaderProps = {
  shader?: string;
  flags?: Record<string, boolean>;
  flagArgs?: Record<string, string>;
  help?: boolean;
};

const Shader = ({ shader, flags, flagArgs, help }: ShaderProps) => {
  const canvasRef = useRef(null);
  const fragmenRef = useRef(null);
  const [mode, setMode] = useState(0);
  const [status, setStatus] = useState("");
  const [msg, setMsg] = useState("");
  const [shaderSource, setShaderSource] = useState(`
        vec3 d=normalize(FC.xyz*2.-r.xyy),p;vec2 u=FC.xy/r-.5;for(float i,j;i++<1e1;p+=d*(snoise3D(p*.1*j-t*.2)/j+6.-p.y*.5+p.z*.5))j=exp(mod(i,5.)*.6);o=vec4(texture(b,.5+u-u*fsnoise(u+t)/4e1).gba,refract(normalize(cross(dFdx(p),dFdy(p))),d,1.2).z+.02/length(u));
      `);

  useEffect(() => {
    if (canvasRef.current) {
      const options = {
        target: canvasRef.current,
        mouse: true,
        resize: true,
        escape: true,
      };
      fragmenRef.current = new Fragmen(options);

      const tryRender = (mode) => {
        return new Promise((resolve) => {
          fragmenRef.current.mode = mode;
          fragmenRef.current.render(shaderSource);
          resolve(fragmenRef.current.run);
        });
      };

      const initializeShader = async () => {
        for (let mode = 0; mode <= 11; mode++) {
          const success = await tryRender(mode);
          setMode(mode);
          if (success) break;
        }
      };

      void initializeShader();
    }

    return () => {
      // Cleanup if necessary
    };
  }, []);

  const handleModeChange = (event) => {
    const lastMode = mode;
    const newMode = parseInt(event.target.value);
    if (fragmenRef.current) {
      fragmenRef.current.mode = newMode;
      fragmenRef.current.render(fragmenRef.current.FS);
      console.log(fragmenRef.current.run);
      if (!fragmenRef.current.run) {
        fragmenRef.current.mode = lastMode;
        fragmenRef.current.render(fragmenRef.current.FS);
      }
    }
  };

  return (
    <>
      <div id="wrap">
        <div className="w-full h-full">
          <canvas id="webgl" ref={canvasRef}></canvas>
        </div>
        <ModeSelect onModeChange={handleModeChange} defaultMode={mode} />
      </div>
    </>
  );
};

export default Shader;
