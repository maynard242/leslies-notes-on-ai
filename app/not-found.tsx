import Link from "next/link";

export default function NotFound() {
  return <div className="not-found shell"><p className="eyebrow">404 / Off the map</p><h1>That note is not here.</h1><p>It may have moved, or it may not have been written yet.</p><Link className="text-link" href="/">Return to the library →</Link></div>;
}
