import Logo from "./Logo";
import LanguageToggle from "./LanguageToggle";

export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-ink-deep">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo />
        <LanguageToggle />
      </div>
    </nav>
  );
}
