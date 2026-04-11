"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";

type PrintMode = "archive" | "parent" | null;

type PrintContextValue = {
  maskPhone: boolean;
  triggerPrint: (mode: "archive" | "parent") => void;
};

const PrintContext = createContext<PrintContextValue | null>(null);

export function PrintProvider({ children }: { children: ReactNode }) {
  const [printMode, setPrintMode] = useState<PrintMode>(null);

  const triggerPrint = useCallback((mode: "archive" | "parent") => {
    flushSync(() => {
      setPrintMode(mode);
    });
    window.print();
    setPrintMode(null);
  }, []);

  return (
    <PrintContext value={{ maskPhone: printMode === "parent", triggerPrint }}>
      {children}
    </PrintContext>
  );
}

export function usePrintContext(): PrintContextValue {
  const ctx = useContext(PrintContext);
  if (!ctx) {
    throw new Error("usePrintContext must be used within a PrintProvider");
  }
  return ctx;
}
