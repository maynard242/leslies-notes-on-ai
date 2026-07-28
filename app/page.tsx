import { NoteLibrary } from "@/components/note-library";
import { listNotes } from "@/lib/notes";
import { attribution } from "@/lib/site";

export default function Home() {
  const notes = listNotes();
  return (
    <>
      <section className="hero">
        <div className="shell hero-grid">
          <div>
            <p className="eyebrow">A reference library by Leslie Teo</p>
            <h1>Leslie’s Notes<br />on <em>AI</em></h1>
          </div>
          <div className="hero-copy">
            <p className="hero-lede">How AI systems work, fail, and are governed.</p>
            <p>Practical technical references for using and adopting AI safely.</p>
            <p className="attribution">{attribution}</p>
            <a className="text-link" href="#notes">Browse the library <span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <div className="shell loop-strip" aria-label="Reference method">
          {['Frame', 'Understand', 'Connect', 'Evaluate', 'Apply', 'Verify', 'Revisit'].map((step, index) => (
            <span key={step}><b>{String(index + 1).padStart(2, '0')}</b>{step}</span>
          ))}
        </div>
      </section>

      <section className="principles shell" aria-labelledby="principles-title">
        <div>
          <p className="section-number">01 / Reference method</p>
          <h2 id="principles-title">Built to be useful: technical, living, and maintained.</h2>
        </div>
        <div className="principle-grid">
          <article><span>Find</span><h3>Lead with the answer</h3><p>Start with the question, then make the reasoning and evidence easy to recover.</p></article>
          <article><span>Keep</span><h3>Preserve the working detail</h3><p>Keep the models, controls, examples, citations, and caveats—not just the conclusion.</p></article>
          <article><span>Maintain</span><h3>Show what changed</h3><p>Keep versions, checked-as-of dates, sources, and known limits close to the claim.</p></article>
        </div>
      </section>

      <section className="library-section" id="notes" aria-labelledby="notes-title">
        <div className="shell">
          <div className="section-heading">
            <div><p className="section-number">02 / Library</p><h2 id="notes-title">Reference notes</h2></div>
            <p>Practical technical references for using and adopting AI safely. Search by title, kind, or topic.</p>
          </div>
          <NoteLibrary notes={notes} />
        </div>
      </section>
    </>
  );
}
