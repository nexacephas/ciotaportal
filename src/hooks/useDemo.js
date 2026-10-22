/* eslint react-refresh/only-export-components: off */
import { useContext } from "react";
import { DemoContext } from "../app/providers/DemoContext";

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemo must be used within DemoProvider.");
  return context;
}
