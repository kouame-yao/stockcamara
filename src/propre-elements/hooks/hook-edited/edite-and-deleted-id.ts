"use client";
import { useState } from "react";

let edited: string;
export const useHandleId = () => {
  const [id, setId] = useState<string>(edited || "");
  const HandleId = (id: string) => {
    edited = id;
    setId(id);
  };

  return { id, HandleId };
};
