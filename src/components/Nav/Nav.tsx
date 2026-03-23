"use client";

import { useState, useEffect } from "react";
import Logo from "./Logo";
import LanguageToggle from "./LanguageToggle";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border bg-[var(--glass-t1-bg)] backdrop-blur-[20px] backdrop-saturate-[1.5] shadow-[inset_1px_1px_0_0_var(--glass-t1-border-highlight)]"
          : "bg-ink-deep"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo />
        <div className="flex items-center gap-1">
          <LanguageToggle />
        </div>
      </div>
    </nav>
  );
}
