import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="wordmark" href="/" aria-label="Leslie’s Notes on AI home">
          <span className="wordmark-mark" aria-hidden="true">LN</span>
          <span>Leslie’s Notes on AI</span>
        </Link>
        <nav aria-label="Primary navigation">
          <Link href="/#notes">Notes</Link>
          <Link href="/feed.xml">RSS</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
