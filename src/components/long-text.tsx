// Text written by the admin in a plain text box, shown as paragraphs: each line break starts a new one.
export default function LongText({ value, className }: { value: string; className?: string }) {
  const paragraphs = value.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  if (!paragraphs.length) return null;
  return <div className={className}>{paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>;
}
