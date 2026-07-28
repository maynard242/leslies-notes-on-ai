import { NoteLibrary } from "@/components/note-library";
import { listNotes } from "@/lib/notes";
import { attribution } from "@/lib/site";

const methodSteps = ["Frame", "Understand", "Connect", "Evaluate", "Apply", "Verify", "Revisit"];

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
            <p className="hero-lede">Practical notes on building, using, and governing AI.</p>
            <p>These notes start with questions I keep returning to: things I am trying to learn, decisions I face, and problems I have been mulling over. They run from model building to board governance.</p>
            <p>The notes are deliberately opinionated. They should also show their evidence, limits, and changes.</p>
            <p className="hero-collaboration"><strong>Made with AI agents; steered by Leslie Teo.</strong> Claude, GPT, Gemini, GLM, Kimi, SEA-LION, and others help research, draft, check, organize, and maintain the library. I set the questions, direction, and style, and remain responsible for what is published.</p>
            <p className="attribution">{attribution}</p>
            <a className="text-link" href="#notes">Browse the library <span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <div className="shell loop-strip" aria-label="How these notes are made">
          {methodSteps.map((step, index) => (
            <span key={step}><b>{String(index + 1).padStart(2, '0')}</b>{step}</span>
          ))}
        </div>
      </section>

      <section className="principles shell" aria-labelledby="principles-title">
        <div>
          <p className="section-number">01 / How these notes are made</p>
          <h2 id="principles-title">A working method, not a claim to final answers.</h2>
        </div>
        <div className="principle-grid">
          <article><span>Start</span><h3>Begin with a live question</h3><p>Start with a decision, a gap in understanding, or a problem worth thinking through—not a topic for its own sake.</p></article>
          <article><span>Work</span><h3>Use agents, keep judgment</h3><p>Agents can research, draft, test, and maintain. They do not choose the question or replace editorial responsibility.</p></article>
          <article><span>Revisit</span><h3>Leave an evidence trail</h3><p>Keep sources, caveats, versions, and checked-as-of dates close to the claim, then return when the evidence changes.</p></article>
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
