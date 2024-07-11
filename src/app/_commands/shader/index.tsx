import React, { useEffect, useRef, useState } from "react";
import { Fragmen } from "@/public/js/fragmen.js";
import { CommandParams } from "..";
export { default as handleShader } from "./handle";

const examples = {
  ocean: [
    `vec3 d=normalize(FC.xyz*2.-r.xyy),p;vec2 u=FC.xy/r-.5;for(float i,j;i++<1e1;p+=d*(snoise3D(p*.1*j-t*.2)/j+6.-p.y*.5+p.z*.5))j=exp(mod(i,5.)*.6);o=vec4(texture(b,.5+u-u*fsnoise(u+t)/4e1).gba,refract(normalize(cross(dFdx(p),dFdy(p))),d,1.2).z+.02/length(u));`,
    null,
  ],
  crystal: [
    `for(float i,g,e,s;i++<80.;o+=.1/exp(e+3.+sin(vec4(1,1.5,2,0)-log(s)))){vec3 p=vec3((FC.xy*2.-r)/r.y*g,g);mat2 m=rotate2D(t*.2);p.xz*=m;p.yz*=m;p.z+=t/PI;p++;s=8.;for(int j;j++<9;p/=e)p=mod(p-1.,2.)-1.,p.xz*=rotate2D(PI/4.),s/=e=exp(dot(p,p)-1.6);g+=e=length(p)/s;}`,
    `https://x.com/zozuar/status/1639657028946673665`,
  ],
  mountain: [
    `for(float i,e,g,v,z=exp2(mod(-t,8.)*.5-4.);i++<1e2;o+=.01/exp(e*3e3/z)){vec3 k,q,p=vec3((FC.xy-.5*r)/r.y*g,z-g)-i/1e5*z;k.xy+=v=1.;e=p.z/3.;for(q=p.yxz*k*rotate3D(3./PI,k);v<9e3;v*=-4.)p=abs(q*v-round(q*v)),e-=min(p.x,min(p.y,p.z))/v;g+=e*.2;}`,
    `https://x.com/zozuar/status/1641101442298568704`,
  ],
  snow: [
    `for(float i,T;i<1.;i+=.01){vec3 P=vec3(1.-fract(T=t+i),sin(vec2(1,1.1)*T+fract(sin(vec2(1,2)*(ceil(T)+i))*1e4)*PI2)*.2);o+=smoothstep(.03,0.,length(cross(normalize(vec3(r.y,FC.xy-r*.5)),P)))*exp(-dot(P,P)*4.);}`,
    `https://x.com/kamoshika_vrc/status/1707410868613550119`,
  ],
  discovery: [
    `for (O *= C; C < 2e2; O += pow(.003 / abs(length(I - vec2(sin(C*.18 + S*.5),cos(C*.2 * (.96 + sin(S) * .04) + S))) + .015 * sin(S*4. + C*.033)) * (1. + cos(  C++  * .022 - S - S +
  log(1. + length(I) * 4.) + vec4(0,1,2,0))), O-O+1.2));`,
    `https://x.com/kishimisu/status/1802381432985116923`,
  ],
};

const ExampleSelect = ({ onExampleChange, defaultExample }) => {
  return (
    <select
      className="w-auto dark:bg-gray-800 dark:text-white"
      onChange={onExampleChange}
      value={defaultExample}
    >
      {Object.keys(examples).map((example) => (
        <option key={example} value={example}>
          {example}
        </option>
      ))}
    </select>
  );
};

const ModeSelect = ({ onModeChange, defaultMode }) => {
  return (
    <div>
      <h3
        title="classic: An ordinary shader editor.
geek: Uniform variables become a single character.
geeker: geek mode + you don't have to define precision and uniform variables by yourself.
geekest: geeker mode + 'void main(){}' can be omitted, 'gl_FragCoord' can be described as 'FC'. In addition, a variety of GLSL snippets are available."
      >
        Type of Shader
      </h3>
      <div>
        <select
          className="w-auto dark:bg-gray-800 dark:text-white"
          onChange={onModeChange}
          value={defaultMode}
        >
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
  modeArg?: number;
};

const Shader = ({ shader, modeArg }: ShaderProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fragmenRef = useRef(null);
  const [mode, setMode] = useState(modeArg ?? 0);
  const [msg, setMsg] = useState("");
  const [example, setExample] = useState<keyof typeof examples>("ocean");

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.style.setProperty("animation", "none", "important");
      canvasRef.current.style.setProperty("isolation", "isolate", "important");
      canvasRef.current.style.setProperty("opacity", "1", "important");

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
          fragmenRef.current.render(examples[example][0]);
          resolve(fragmenRef.current.run);
        });
      };

      const initializeShader = async () => {
        for (let mode = 0; mode <= 11; mode++) {
          const success = await tryRender(mode);

          if (success) {
            setMode(mode);
            break;
          }
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

  const handleExampleChange = (event) => {
    const newExample = event.target.value;
    fragmenRef.current.render(examples[newExample][0]);
    setExample(newExample);
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          width: "80vw",
          height: "calc(70vw * 9 / 16)",
        }}
      />
      <ModeSelect onModeChange={handleModeChange} defaultMode={mode} />
      <ExampleSelect
        onExampleChange={handleExampleChange}
        defaultExample={example}
      />
    </>
  );
};

export default Shader;
