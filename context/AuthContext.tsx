"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

type AuthResult = { token: string; user: User };
type AuthState = { user: User | null; token: string | null };
type RegisterResult = { requiresVerification: boolean; email: string; devCode?: string };
type ResendResult = { message: string; devCode?: string };

type Ctx = AuthState & {
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<RegisterResult>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendCode: (email: string) => Promise<ResendResult>;
  logout: () => void;
};

const KEY = "aurelle-auth";
const AuthCtx = createContext<Ctx>(null as unknown as Ctx);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, token: null });
  const [ready, setReady] = useState(false);

  // page load pe saved login wapas laao
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  const save = useCallback((r: AuthResult) => {
    const s = { user: r.user, token: r.token };
    setState(s);
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {}
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      save(await api<AuthResult>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }));
    },
    [save]
  );

  // register ab login nahi karata: pehle email verify karna padta hai
  const register = useCallback(async (fullName: string, email: string, password: string) => {
    return api<RegisterResult>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ fullName, email, password }),
    });
  }, []);

  // sahi code dene par backend token deta hai, yahin login ho jaata hai
  const verifyEmail = useCallback(
    async (email: string, code: string) => {
      save(
        await api<AuthResult>("/api/auth/verify-email", {
          method: "POST",
          body: JSON.stringify({ email, code }),
        })
      );
    },
    [save]
  );

  const resendCode = useCallback(async (email: string) => {
    return api<ResendResult>("/api/auth/resend-code", { method: "POST", body: JSON.stringify({ email }) });
  }, []);

  const logout = useCallback(() => {
    setState({ user: null, token: null });
    try {
      localStorage.removeItem(KEY);
    } catch {}
  }, []);

  const value = useMemo(
    () => ({ ...state, ready, login, register, verifyEmail, resendCode, logout }),
    [state, ready, login, register, verifyEmail, resendCode, logout]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
