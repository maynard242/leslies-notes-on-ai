import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div>
          <strong>Leslie’s Notes on AI</strong>
          <p>{site.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
