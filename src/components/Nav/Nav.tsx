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
      className={`fixed top-0 left-0 right-0 z-50 border-b border-border transition-all duration-300 ${
        scrolled ? "bg-ink-deep/80 backdrop-blur-md" : "bg-ink-deep"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo />
        <LanguageToggle />
      </div>
    </nav>
  );
}
