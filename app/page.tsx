import { NoteLibrary } from "@/components/note-library";
import { listNotes } from "@/lib/notes";

export default function Home() {
  const notes = listNotes();
  return (
    <>
      <section className="hero">
        <div className="shell hero-grid">
          <div>
            <p className="eyebrow">A living field notebook</p>
            <h1>Leslie’s Notes<br />on <em>AI</em></h1>
          </div>
          <div className="hero-copy">
            <p className="hero-lede">How AI systems work, fail, and are governed.</p>
            <p>Research translated into clear explanations, engineering controls, worked examples, and dated evidence.</p>
            <a className="text-link" href="#notes">Explore the notes <span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <div className="shell loop-strip" aria-label="AI governance control loop">
          {['Specify', 'Trace', 'Evaluate', 'Gate', 'Enforce', 'Observe', 'Audit'].map((step, index) => (
            <span key={step}><b>{String(index + 1).padStart(2, '0')}</b>{step}</span>
          ))}
        </div>
      </section>

      <section className="principles shell" aria-labelledby="principles-title">
        <div>
          <p className="section-number">01 / Method</p>
          <h2 id="principles-title">Learn by making the evidence legible.</h2>
        </div>
        <div className="principle-grid">
          <article><span>Question</span><h3>Start with a decision</h3><p>What would count as evidence, and what remains uncertain?</p></article>
          <article><span>Build</span><h3>Connect ideas to artifacts</h3><p>Turn concepts into tests, controls, records, and operating choices.</p></article>
          <article><span>Revise</span><h3>Show what changed</h3><p>Date volatile claims and maintain the note as the world moves.</p></article>
        </div>
      </section>

      <section className="library-section" id="notes" aria-labelledby="notes-title">
        <div className="shell">
          <div className="section-heading">
            <div><p className="section-number">02 / Library</p><h2 id="notes-title">Published notes</h2></div>
            <p>Long-form references and shorter learning modules, maintained from their primary sources.</p>
          </div>
          <NoteLibrary notes={notes} />
        </div>
      </section>
    </>
  );
}
