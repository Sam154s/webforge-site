export function Footer() {
  return (
    <footer className="px-8 py-8 border-t border-border flex items-center justify-between">
      <span className="font-sans text-xs text-text-muted">
        © WebForge 2026
      </span>
      <a
        href="mailto:hello@webforge.build"
        className="font-sans text-xs text-text-muted hover:text-text-sec transition-colors duration-200"
      >
        hello@webforge.build
      </a>
    </footer>
  );
}
