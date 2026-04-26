"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export function HomeIntroShell({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (mediaQuery.matches) {
      setIsReady(true);
      setShowOverlay(false);
      return;
    }

    document.body.classList.add("home-intro-running");

    const frameId = window.requestAnimationFrame(() => {
      setIsReady(true);
    });

    const overlayTimer = window.setTimeout(() => {
      document.body.classList.remove("home-intro-running");
      setShowOverlay(false);
    }, 760);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(overlayTimer);
      document.body.classList.remove("home-intro-running");
    };
  }, []);

  return (
    <div className={cn("home-intro-shell", isReady && "home-intro-ready")}>
      {showOverlay ? (
        <div className="home-intro-overlay" aria-hidden="true">
          <div className="home-intro-brand">克拉斯单词记忆</div>
        </div>
      ) : null}
      {children}
    </div>
  );
}
