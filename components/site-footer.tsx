import { attribution } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div>
          <strong>Leslie’s Notes on AI</strong>
          <p>Practical technical references for using and adopting AI safely.</p>
        </div>
        <p className="attribution">{attribution}</p>
      </div>
    </footer>
  );
}
