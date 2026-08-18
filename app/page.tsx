import { NoteLibrary } from "@/components/note-library";
import { listNotes } from "@/lib/notes";
import { site } from "@/lib/site";

const methodSteps = ["Ask", "Read", "Draft", "Check", "Edit", "Cite", "Revisit"];

const readerRules = [
  ["01 / Sources", "Read the source", "Use these notes to find useful papers, standards, and other sources. Then open them. A link is more useful than a very confident summary of a link."],
  ["02 / Accuracy", "Check the important details", "Check dates, names, numbers, quotations, and anything you might repeat elsewhere. AI can make mistakes while sounding unusually pleased with itself."],
  ["03 / Questions", "Bring your own question", "A note is most useful when you are trying to decide something, understand a disagreement, or fill a gap in your thinking. It is less useful as background decoration."],
  ["04 / Privacy", "Keep private things private", "Do not paste sensitive work into a public AI tool just because the box looks conversational. It is software, not a colleague with a locked drawer."],
  ["05 / Judgment", "Make it your own", "Keep the useful ideas, examples, and sources. Add your own view. If a page could have been written by anyone, it probably needs another edit."],
] as const;

export default function Home() {
  const notes = listNotes();
  return (
    <>
      <section className="hero">
        <div className="shell hero-grid">
          <div>
            <p className="eyebrow">A personal notebook by Leslie Teo</p>
            <h1>Notes on <em>AI</em>,<br />made with help.</h1>
          </div>
          <div className="hero-copy">
            <p className="hero-lede">{site.tagline} This is a small experiment in thinking and writing with AI without pretending that it has done the thinking for me.</p>
            <p>These are working notes on questions I keep returning to: things I am trying to understand, decisions I face, and problems worth worrying at. They run from data and model building to adoption, strategy, and governance.</p>
            <p>AI helps me find material, shape a first draft, and spot gaps. It can also produce bland, convincing prose at great speed. Most of these notes are summaries and working views, not original research or final answers. Use them to find a useful idea or source, then make up your own mind.</p>
            <p className="hero-collaboration"><strong>Made with AI and reviewed by Leslie Teo.</strong> I choose the questions, check the sources, edit the prose, and take responsibility for what is published. The machine gets no byline and no escape hatch.</p>
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
          <p className="section-number">01 / How to use this place</p>
          <h2 id="principles-title">Useful notes, not the last word.</h2>
        </div>
        <div className="principle-grid">
          {readerRules.map(([label, title, copy]) => (
            <article key={title}><span>{label}</span><h3>{title}</h3><p>{copy}</p></article>
          ))}
        </div>
      </section>

      <section className="library-section" id="notes" aria-labelledby="notes-title">
        <div className="shell">
          <div className="section-heading">
            <div><p className="section-number">02 / Library</p><h2 id="notes-title">Reference notes</h2></div>
            <p>Practical references for building and using AI—and for making sound strategic and governance choices. Search by title, kind, or topic.</p>
          </div>
          <NoteLibrary notes={notes} />
        </div>
      </section>
    </>
  );
}
