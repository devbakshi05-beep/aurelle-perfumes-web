"use client";
import { createContext, useCallback, useContext, useRef, useState } from "react";

type Ctx = { toast: (message: string) => void };
const ToastCtx = createContext<Ctx>({ toast: () => {} });
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback((m: string) => {
    setMsg(m);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(""), 2800);
  }, []);

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-gold px-6 py-3 text-on-gold shadow-lg transition-all duration-300 ${
          msg ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        {msg}
      </div>
    </ToastCtx.Provider>
  );
}
