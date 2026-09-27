interface HighlightMatchProps {
  readonly text: string;
  readonly query: string;
}

export function HighlightMatch({ text, query }: HighlightMatchProps) {
  const q = query.trim();
  const index = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (index < 0) return <>{text}</>;

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-sm bg-accent-rose/15 px-0.5 font-semibold text-foreground">
        {text.slice(index, index + q.length)}
      </mark>
      {text.slice(index + q.length)}
    </>
  );
}
