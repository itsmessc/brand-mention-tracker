import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const SOURCES = ['twitter', 'instagram', 'reddit', 'news'];
const SENTIMENTS = ['positive', 'neutral', 'negative'];

export function MentionFilters({ filters, onChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
      <div className="md:col-span-2">
        <label className="text-xs text-muted-foreground">Search body</label>
        <div className="relative">
          <Search className="h-4 w-4 absolute left-2 top-2.5 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="text search…"
            value={filters.q ?? ''}
            onChange={(e) => onChange({ q: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Source</label>
        <Select
          value={filters.source ?? ''}
          onChange={(e) => onChange({ source: e.target.value })}
        >
          <option value="">All</option>
          {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Sentiment</label>
        <Select
          value={filters.sentiment ?? ''}
          onChange={(e) => onChange({ sentiment: e.target.value })}
        >
          <option value="">All</option>
          {SENTIMENTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Tag</label>
        <Input
          value={filters.tag ?? ''}
          onChange={(e) => onChange({ tag: e.target.value })}
          placeholder="single tag"
        />
      </div>
      <div className="md:col-span-3 grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-muted-foreground">From</label>
          <Input
            type="date"
            value={filters.from ?? ''}
            onChange={(e) => onChange({ from: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">To</label>
          <Input
            type="date"
            value={filters.to ?? ''}
            onChange={(e) => onChange({ to: e.target.value })}
          />
        </div>
      </div>
      <div className="md:col-span-3 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange({ source: '', sentiment: '', tag: '', from: '', to: '', q: '' })}
        >
          <X className="h-4 w-4" /> Clear
        </Button>
      </div>
    </div>
  );
}
