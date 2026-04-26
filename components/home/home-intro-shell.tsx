"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export function HomeIntroShell({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (mediaQuery.matches) {
      setIsReady(true);
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setIsReady(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className={cn("home-intro-shell", isReady && "home-intro-ready")}>
      {children}
    </div>
  );
}
