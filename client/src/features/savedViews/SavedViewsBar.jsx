import { useState } from 'react';
import { Bookmark, BookmarkPlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useSavedViews, useCreateSavedView, useDeleteSavedView } from './hooks';

export function SavedViewsBar({ brandId, currentFilters, onApply }) {
  const { data: views = [] } = useSavedViews(brandId);
  const create = useCreateSavedView(brandId);
  const del = useDeleteSavedView(brandId);

  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState(null);

  const filtersForSaving = stripPagination(currentFilters);

  async function onSave(e) {
    e.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({ name: name.trim(), filters: filtersForSaving });
      setName('');
      setSaving(false);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
        <Bookmark className="h-3 w-3" /> Saved views:
      </span>
      {views.length === 0 && (
        <span className="text-xs text-muted-foreground italic">none yet</span>
      )}
      {views.map((v) => (
        <span key={v._id} className="inline-flex items-center rounded-full border border-border bg-white text-xs">
          <button
            className="px-2 py-1 hover:bg-accent rounded-l-full"
            onClick={() => onApply(v.filters)}
            title="Apply this view"
          >
            {v.name}
          </button>
          <button
            className="px-1.5 py-1 text-muted-foreground hover:text-destructive rounded-r-full"
            title="Delete view"
            onClick={() => del.mutate(v._id)}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </span>
      ))}
      <Button variant="outline" size="sm" onClick={() => setSaving(true)}>
        <BookmarkPlus className="h-4 w-4" /> Save current
      </Button>

      <Dialog open={saving} onOpenChange={setSaving}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save current filters as a view</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSave} className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. negative twitter (support)"
                required
              />
            </div>
            <pre className="text-xs bg-muted/40 p-2 rounded max-h-32 overflow-auto">
              {JSON.stringify(filtersForSaving, null, 2)}
            </pre>
            {error && <div className="text-sm text-destructive">{error}</div>}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={create.isPending}>Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function stripPagination(f) {
  const { page, limit, ...rest } = f || {};
  return rest;
}
