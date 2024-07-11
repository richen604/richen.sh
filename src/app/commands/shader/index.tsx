import React, { useEffect, useRef, useState } from "react";
import { Fragmen } from "./fragmen.js";
import { displayAtom, store } from "@/app/store/terminalAtoms";
export { default as handleShader } from "./handle";

const examples = {
  submerge: [
    `vec3 d=normalize(FC.xyz*2.-r.xyy),p;vec2 u=FC.xy/r-.5;for(float i,j;i++<1e1;p+=d*(snoise3D(p*.1*j-t*.2)/j+6.-p.y*.5+p.z*.5))j=exp(mod(i,5.)*.6);o=vec4(texture(b,.5+u-u*fsnoise(u+t)/4e1).gba,refract(normalize(cross(dFdx(p),dFdy(p))),d,1.2).z+.02/length(u));`,
    "https://x.com/XorDev/status/1638276547411955731",
  ],
  blossom: [
    `vec3 p,q=vec3(-.1,.65,-.6);for(float j,i,e,v,u;i++<130.;o+=.007/exp(3e3/(v*vec4(9,5,4,4)+e*4e6))){p=q+=vec3((FC.xy-.5*r)/r.y,1)*e;for(j=e=v=7.;j++<21.;e=min(e,max(length(p.xz=abs(p.xz*rotate2D(j+sin(1./u+t)/v))-.53)-.02/u,p.y=1.8-p.y)/v))v/=u=dot(p,p),p/=u+.01;}`,
    `https://x.com/zozuar/status/1763906851337326736`,
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
};

const ExampleSelect = ({
  onExampleChange,
  defaultExample,
}: {
  onExampleChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  defaultExample: keyof typeof examples;
}) => {
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

const ModeSelect = ({
  onModeChange,
  defaultMode,
}: {
  onModeChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  defaultMode: number;
}) => {
  return (
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
  );
};

export type ShaderProps = {
  shader?: string;
  exampleArg: keyof typeof examples;
  modeArg?: number;
};

const Shader = ({ modeArg, exampleArg = "submerge" }: ShaderProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fragmenRef = useRef<Fragmen | null>(null);
  const [mode, setMode] = useState(modeArg ?? 0);
  const [msg, setMsg] = useState("");
  const [example, setExample] = useState<keyof typeof examples>(exampleArg);

  useEffect(() => {
    if (canvasRef.current) {
      const options = {
        target: canvasRef.current,
        mouse: true,
        resize: true,
        escape: true,
      };
      fragmenRef.current = new Fragmen(options);

      const tryRender = (mode: number) => {
        return new Promise((resolve) => {
          if (!fragmenRef.current) {
            return resolve(false);
          }
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

      fragmenRef.current.onBuild((status: string, msg: string) => {
        const msgParts = msg.split("\n");

        if (status === "success") {
          setMsg(msgParts[0]);
        } else {
          setMsg(msgParts[0]);
        }
      });
    }

    return () => {
      if (fragmenRef.current) {
        fragmenRef.current = null;
      }
    };
  }, [example]);

  const handleModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const lastMode = mode;
    const newMode = parseInt(event.target.value);
    if (fragmenRef.current) {
      fragmenRef.current.mode = newMode;
      fragmenRef.current.render(fragmenRef.current.FS);

      if (!fragmenRef.current.run) {
        fragmenRef.current.mode = lastMode;
        fragmenRef.current.render(fragmenRef.current.FS);
      } else {
        setMode(newMode);
        store.set(displayAtom, [
          JSON.stringify({
            componentKey: "shader",
            props: { modeArg: newMode, exampleArg: example },
            time: new Date().toISOString(),
          }),
        ]);
      }
    }
  };

  const handleExampleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!fragmenRef.current) {
      return;
    }
    const newExample = event.target.value as keyof typeof examples;
    fragmenRef.current.render(examples[newExample][0]);
    setExample(newExample);
    store.set(displayAtom, [
      JSON.stringify({
        componentKey: "shader",
        props: { modeArg: mode, exampleArg: newExample },
        time: new Date().toISOString(),
      }),
    ]);
  };

  return (
    <>
      <div className="flex flex-col justify-start items-start">
        <canvas
          ref={canvasRef}
          style={{
            width: "75%",
            height: "60%",
          }}
        />
        {examples[example][1] && (
          <div className="text-xs text-gray-500 m-2">
            Credit:{" "}
            <a
              href={examples[example][1]}
              target="_blank"
              rel="noopener noreferrer"
            >
              {examples[example][1]}
            </a>
          </div>
        )}
        <div className="flex flex-row place-self-start gap-2">
          <ModeSelect onModeChange={handleModeChange} defaultMode={mode} />
          <ExampleSelect
            onExampleChange={handleExampleChange}
            defaultExample={example}
          />
          <div className="comment text-xs text-pretty w-full">{msg}</div>
        </div>
      </div>
    </>
  );
};

export default Shader;
