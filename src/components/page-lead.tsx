// A short lead above a list page's search bar (players, media): a small gold ornament and a headline, then one line
// of text.

export default function PageLead({ title, text }: { title: string; text: string }) {
  return (
    <div className="page-lead">
      <h2><span className="page-lead-mark" aria-hidden="true" />{title}</h2>
      <p>{text}</p>
    </div>
  );
}
