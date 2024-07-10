import React from "react";

const ModeSelect = () => {
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
        <select id="modeselect">
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

const index = () => {
  return (
    <>
      <div id="wrap">
        <div id="canvaswrap">
          <canvas id="webgl"></canvas>
        </div>
        <ModeSelect />
      </div>
    </>
  );
};

export default index;
