import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { portalApi } from "../lib/api";
import type { PortalAccount } from "../types";

type PortalAuthValue = {
  account: PortalAccount | null;
  token: string | null;
  validatingSession: boolean;
  signIn: (token: string, account: PortalAccount) => void;
  signOut: () => void;
};

const PortalAuthContext = createContext<PortalAuthValue | null>(null);

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  const [validatingSession, setValidatingSession] = useState(true);
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem("essentia_portal_token");
    const savedAccount = localStorage.getItem("essentia_portal_account");
    if (!savedToken || !savedAccount) return null;
    try { JSON.parse(savedAccount); return savedToken; }
    catch {
      localStorage.removeItem("essentia_portal_token");
      localStorage.removeItem("essentia_portal_account");
      return null;
    }
  });
  const [account, setAccount] = useState<PortalAccount | null>(() => {
    const saved = localStorage.getItem("essentia_portal_account");
    if (!saved) return null;
    try { return JSON.parse(saved) as PortalAccount; }
    catch { return null; }
  });

  useEffect(() => {
    let active = true;

    async function validateSession() {
      if (!token) {
        setValidatingSession(false);
        return;
      }

      try {
        const { data } = await portalApi.get<PortalAccount>("/portal/auth/me");
        if (!active) return;
        localStorage.setItem("essentia_portal_account", JSON.stringify(data));
        setAccount(data);
      } catch {
        if (!active) return;
        localStorage.removeItem("essentia_portal_token");
        localStorage.removeItem("essentia_portal_account");
        setToken(null);
        setAccount(null);
      } finally {
        if (active) setValidatingSession(false);
      }
    }

    void validateSession();
    return () => {
      active = false;
    };
  }, [token]);

  function signIn(newToken: string, newAccount: PortalAccount) {
    localStorage.setItem("essentia_portal_token", newToken);
    localStorage.setItem("essentia_portal_account", JSON.stringify(newAccount));
    setToken(newToken);
    setAccount(newAccount);
  }

  function signOut() {
    localStorage.removeItem("essentia_portal_token");
    localStorage.removeItem("essentia_portal_account");
    setToken(null);
    setAccount(null);
  }

  return <PortalAuthContext.Provider value={{ account, token, validatingSession, signIn, signOut }}>{children}</PortalAuthContext.Provider>;
}

export function usePortalAuth() {
  const context = useContext(PortalAuthContext);
  if (!context) throw new Error("usePortalAuth deve ser usado dentro de PortalAuthProvider");
  return context;
}
