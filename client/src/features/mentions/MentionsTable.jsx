import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function MentionsTable({ data, pagination, onRowClick }) {
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">
        {pagination.summary} · {total.toLocaleString()} total
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2 w-28">Source</th>
              <th className="px-3 py-2 w-32">Author</th>
              <th className="px-3 py-2">Body</th>
              <th className="px-3 py-2 w-28">Sentiment</th>
              <th className="px-3 py-2">Tags</th>
              <th className="px-3 py-2 w-40">Posted</th>
              <th className="px-3 py-2 w-px"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr
                key={m._id}
                className="border-t border-border hover:bg-muted/30 cursor-pointer"
                onClick={() => onRowClick(m)}
              >
                <td className="px-3 py-2 capitalize">{m.source}</td>
                <td className="px-3 py-2 text-muted-foreground">{m.author || '—'}</td>
                <td className="px-3 py-2 max-w-md">
                  <div className="line-clamp-2">{m.body}</div>
                </td>
                <td className="px-3 py-2">
                  <Badge tone={m.sentiment}>{m.sentiment}</Badge>
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1 flex-wrap">
                    {(m.tags || []).slice(0, 3).map((t) => (
                      <Badge key={t} tone="outline">{t}</Badge>
                    ))}
                    {(m.tags || []).length > 3 && (
                      <span className="text-xs text-muted-foreground">+{m.tags.length - 3}</span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(m.postedAt)}
                </td>
                <td className="px-3 py-2">
                  {m.url && (
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-muted-foreground">
                  No mentions match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!pagination.canPrev}
          onClick={pagination.onPrev}
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!pagination.canNext}
          onClick={pagination.onNext}
        >
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
