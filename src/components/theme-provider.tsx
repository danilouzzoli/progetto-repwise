"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolved: "light" | "dark";
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem("theme") as Theme) || "system";
  });
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    const resolve = (t: Theme) =>
      t === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : t;

    const r = resolve(theme);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResolved(r);
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(r);
    localStorage.setItem("theme", theme);

    let mql: MediaQueryList | null = null;
    const handler = () => {
      if (theme === "system") {
        const r2 = resolve("system");
        setResolved(r2);
        root.classList.remove("light", "dark");
        root.classList.add(r2);
      }
    };
    if (theme === "system") {
      mql = window.matchMedia("(prefers-color-scheme: dark)");
      mql.addEventListener("change", handler);
    }
    return () => {
      mql?.removeEventListener("change", handler);
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState, resolved }}>
      {children}
    </ThemeContext.Provider>
  );
}