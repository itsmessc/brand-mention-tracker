export function TopTagsList({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-muted-foreground">No tags yet.</div>;
  }
  const max = data[0]?.count || 1;
  return (
    <ul className="space-y-2">
      {data.map((t) => (
        <li key={t.tag} className="text-sm">
          <div className="flex justify-between">
            <span className="font-medium">{t.tag}</span>
            <span className="text-muted-foreground tabular-nums">{t.count}</span>
          </div>
          <div className="h-1.5 bg-muted rounded mt-1 overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${(t.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
