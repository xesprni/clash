import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { normalizeBase } from "../lib/utils";

type ClashContextType = {
  baseURL: string;
  token: string;
  setBaseURL: (v: string) => void;
  setToken: (v: string) => void;
  fetcher: (path: string) => Promise<any>;
  request: (path: string, init?: RequestInit) => Promise<any>;
};

const ClashContext = createContext<ClashContextType | undefined>(undefined);

const DEFAULT_BASE = normalizeBase(import.meta.env.VITE_CLASH_API || "http://127.0.0.1:9090");

export function ClashProvider({ children }: { children: React.ReactNode }) {
  const [baseURL, setBaseURL] = useState(() => {
    return normalizeBase(localStorage.getItem("clash.base") || DEFAULT_BASE);
  });
  const [token, setToken] = useState(() => localStorage.getItem("clash.token") || "");

  useEffect(() => {
    localStorage.setItem("clash.base", baseURL);
  }, [baseURL]);

  useEffect(() => {
    localStorage.setItem("clash.token", token);
  }, [token]);

  const request = useCallback(
    async (path: string, init?: RequestInit) => {
      const normalizedBase = normalizeBase(baseURL || DEFAULT_BASE);
      const target = `${normalizedBase}${path.startsWith("/") ? path : `/${path}`}`;
      const headers: HeadersInit = {
        ...(init?.headers || {}),
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      if (init?.body && !headers["Content-Type"] && !(init.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
      }
      const resp = await fetch(target, { ...init, headers });
      if (!resp.ok) {
        const detail = await resp.text();
        throw new Error(detail || resp.statusText);
      }
      const contentType = resp.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        return resp.json();
      }
      return resp.text();
    },
    [baseURL, token]
  );

  const fetcher = useMemo(() => {
    return (path: string) => request(path);
  }, [request]);

  const value = useMemo(
    () => ({ baseURL, token, setBaseURL, setToken, fetcher, request }),
    [baseURL, token, fetcher, request]
  );

  return <ClashContext.Provider value={value}>{children}</ClashContext.Provider>;
}

export function useClash() {
  const ctx = useContext(ClashContext);
  if (!ctx) throw new Error("useClash must be used inside ClashProvider");
  return ctx;
}

