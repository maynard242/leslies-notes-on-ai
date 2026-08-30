import { NoteLibrary } from "@/components/note-library";
import { listNotes } from "@/lib/notes";
import { site } from "@/lib/site";

export default function Home() {
  const notes = listNotes();
  return (
    <>
      <section className="hero">
        <div className="shell hero-grid hero-compact">
          <div><p className="eyebrow">A personal notebook by Leslie Teo</p><h1>Notes on <em>AI</em>, made with help.</h1></div>
          <div className="hero-copy"><p className="hero-lede">{site.tagline}</p><p>Practical technical notes on data, models, adoption, strategy, and governance. Use them to find an idea or source, then make up your own mind.</p><a className="text-link" href="#notes">Browse the library <span aria-hidden="true">↓</span></a></div>
        </div>
      </section>
      <section className="library-section" id="notes" aria-labelledby="notes-title">
        <div className="shell"><div className="section-heading"><div><p className="section-number">Library</p><h2 id="notes-title">Find the note you need.</h2></div><p>Search and browse published notes by section, kind, topic, title, or date. Every page is a public working reference, not the last word.</p></div><NoteLibrary notes={notes} /></div>
      </section>
    </>
  );
}
