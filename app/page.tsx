import { NoteLibrary } from "@/components/note-library";
import { listNotes } from "@/lib/notes";
import { site } from "@/lib/site";

const methodSteps = ["Ask", "Read", "Draft", "Check", "Edit", "Cite", "Revisit"];

export default function Home() {
  const notes = listNotes();
  return (
    <>
      <section className="hero">
        <div className="shell hero-grid hero-compact">
          <div><p className="eyebrow">A personal notebook by Leslie Teo</p><h1>Notes on <em>AI</em>, made with help.</h1></div>
          <div className="hero-copy"><p className="hero-lede">{site.tagline} This is a small experiment in thinking and writing with AI without pretending that it has done the thinking for me.</p><p>These are working notes on questions I keep returning to: things I am trying to understand, decisions I face, and problems worth worrying at. They run from data and model building to adoption, strategy, and governance.</p><p>AI helps me find material, shape a first draft, and spot gaps. It can also produce bland, convincing prose at great speed. Most of these notes are summaries and working views, not original research or final answers. Use them to find a useful idea or source, then make up your own mind.</p><p className="hero-collaboration"><strong>Made with AI and reviewed by Leslie Teo.</strong> I choose the questions, check the sources, edit the prose, and take responsibility for what is published. The machine gets no byline and no escape hatch.</p><a className="text-link" href="#notes">Browse the library <span aria-hidden="true">↓</span></a></div>
        </div>
        <div className="shell loop-strip" aria-label="How these notes are made">
          {methodSteps.map((step, index) => <span key={step}><b>{String(index + 1).padStart(2, "0")}</b>{step}</span>)}
        </div>
      </section>
      <section className="library-section" id="notes" aria-labelledby="notes-title">
        <div className="shell"><div className="section-heading"><div><p className="section-number">Library</p><h2 id="notes-title">Find the note you need.</h2></div><p>Search and browse published notes by section, kind, topic, title, or date. Every page is a public working reference, not the last word.</p></div><NoteLibrary notes={notes} /></div>
      </section>
    </>
  );
}
