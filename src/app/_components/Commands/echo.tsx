"use client";
import React from "react";

type Props = {
  message: string;
};

const Echo = (props: Props) => {
  return <div>{props.message}</div>;
};

export default Echo;
