import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MentionFilters } from '@/features/mentions/MentionFilters';
import { MentionsTable } from '@/features/mentions/MentionsTable';
import { MentionDrawer } from '@/features/mentions/MentionDrawer';
import { NewMentionDialog } from '@/features/mentions/NewMentionDialog';
import { SavedViewsBar } from '@/features/savedViews/SavedViewsBar';
import { useMentions } from '@/features/mentions/hooks';
import { useMentionFilters } from '@/features/mentions/useMentionFilters';
import { mentionsApi } from '@/features/mentions/api';

const PAGE_SIZE = 25;

export default function BrandMentionsPage() {
  const { brandId } = useParams();
  const { filters, setFilters, applyFilterObject } = useMentionFilters();

  const [cursorStack, setCursorStack] = useState([null]);

  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);
  useEffect(() => {
    setCursorStack([null]);
  }, [filtersKey]);

  const query = {
    ...filters,
    cursor: cursorStack[cursorStack.length - 1] || undefined,
    limit: PAGE_SIZE,
  };

  const { data, isFetching, error } = useMentions(brandId, query);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;
  const pagination = {
    page: cursorStack.length,
    totalPages,
    total: data?.total ?? 0,
    canPrev: cursorStack.length > 1,
    canNext: !!data?.nextCursor,
    onPrev: () => setCursorStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
    onNext: () => data?.nextCursor && setCursorStack((s) => [...s, data.nextCursor]),
  };

  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState(null);

  function exportCsv() {
    const url = mentionsApi.exportCsvUrl(brandId, filters);
    window.location.href = url;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-lg font-semibold">Mentions</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> New mention
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="py-4 space-y-4">
          <MentionFilters filters={filters} onChange={setFilters} />
          <SavedViewsBar
            brandId={brandId}
            currentFilters={filters}
            onApply={applyFilterObject}
          />
        </CardContent>
      </Card>

      {error && <div className="text-destructive">{error.message}</div>}
      <div className={isFetching ? 'opacity-60 transition-opacity' : ''}>
        <MentionsTable data={data} pagination={pagination} onRowClick={setSelected} />
      </div>

      <NewMentionDialog open={creating} onOpenChange={setCreating} brandId={brandId} />
      <MentionDrawer
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        mention={selected}
        brandId={brandId}
      />
    </div>
  );
}
