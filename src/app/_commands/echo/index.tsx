"use client";
import React from "react";
export { default as handleEcho } from "./handle";

const Echo = ({ message }: { message: string }) => {
  return <div>{message}</div>;
};

export default Echo;
