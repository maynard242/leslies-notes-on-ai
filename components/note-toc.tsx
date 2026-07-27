import type { TocItem } from "@/lib/notes";

function TocLinks({ items }: { items: TocItem[] }) {
  return (
    <ol>
      {items.map((item) => (
        <li key={item.id} className={item.depth === 3 ? "toc-subitem" : undefined}>
          <a href={`#${item.id}`}>{item.title}</a>
        </li>
      ))}
    </ol>
  );
}

export function NoteToc({ items }: { items: TocItem[] }) {
  if (!items.length) return null;
  return (
    <>
      <aside className="note-toc" aria-label="Table of contents">
        <p>In this note</p>
        <TocLinks items={items} />
      </aside>
      <details className="note-toc-mobile">
        <summary>In this note</summary>
        <TocLinks items={items} />
      </details>
    </>
  );
}
