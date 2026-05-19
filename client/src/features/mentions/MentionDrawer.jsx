import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useUpdateMention, useDeleteMention } from './hooks';

const SENTIMENTS = ['positive', 'neutral', 'negative'];
const SOURCES = ['twitter', 'instagram', 'reddit', 'news'];

export function MentionDrawer({ open, onOpenChange, mention, brandId }) {
  const update = useUpdateMention(brandId);
  const remove = useDeleteMention(brandId);

  const [form, setForm] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mention) {
      setForm({
        source: mention.source,
        author: mention.author ?? '',
        body: mention.body,
        url: mention.url ?? '',
        sentiment: mention.sentiment,
        tags: (mention.tags ?? []).join(', '),
        postedAt: mention.postedAt ? new Date(mention.postedAt).toISOString().slice(0, 16) : '',
      });
      setError(null);
    }
  }, [mention]);

  if (!mention || !form) return null;

  const set = (patch) => setForm((s) => ({ ...s, ...patch }));

  async function onSave() {
    setError(null);
    try {
      await update.mutateAsync({
        id: mention._id,
        data: {
          source: form.source,
          author: form.author,
          body: form.body,
          url: form.url || undefined,
          sentiment: form.sentiment,
          tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
          postedAt: form.postedAt ? new Date(form.postedAt).toISOString() : undefined,
        },
      });
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
    }
  }

  async function onDelete() {
    if (!confirm('Delete this mention?')) return;
    try {
      await remove.mutateAsync(mention._id);
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent side="right">
        <DialogHeader>
          <DialogTitle>Edit mention</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Source</Label>
              <Select value={form.source} onChange={(e) => set({ source: e.target.value })}>
                {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
            <div>
              <Label>Sentiment</Label>
              <Select value={form.sentiment} onChange={(e) => set({ sentiment: e.target.value })}>
                {SENTIMENTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
          </div>
          <div>
            <Label>Author</Label>
            <Input value={form.author} onChange={(e) => set({ author: e.target.value })} />
          </div>
          <div>
            <Label>Body</Label>
            <Textarea
              value={form.body}
              onChange={(e) => set({ body: e.target.value })}
              rows={5}
            />
          </div>
          <div>
            <Label>URL</Label>
            <Input value={form.url} onChange={(e) => set({ url: e.target.value })} />
          </div>
          <div>
            <Label>Tags (comma separated)</Label>
            <Input value={form.tags} onChange={(e) => set({ tags: e.target.value })} />
          </div>
          <div>
            <Label>Posted at</Label>
            <Input
              type="datetime-local"
              value={form.postedAt}
              onChange={(e) => set({ postedAt: e.target.value })}
            />
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
        </div>

        <DialogFooter>
          <Button variant="destructive" onClick={onDelete} className="mr-auto">
            Delete
          </Button>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={onSave} disabled={update.isPending}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
