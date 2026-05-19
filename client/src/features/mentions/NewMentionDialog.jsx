import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useCreateMention } from './hooks';

const SOURCES = ['twitter', 'instagram', 'reddit', 'news'];
const SENTIMENTS = ['positive', 'neutral', 'negative'];

const emptyForm = {
  source: 'twitter',
  author: '',
  body: '',
  url: '',
  sentiment: 'neutral',
  tags: '',
  postedAt: new Date().toISOString().slice(0, 16),
};

export function NewMentionDialog({ open, onOpenChange, brandId }) {
  const create = useCreateMention(brandId);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);

  const set = (patch) => setForm((s) => ({ ...s, ...patch }));

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({
        source: form.source,
        author: form.author || undefined,
        body: form.body,
        url: form.url || undefined,
        sentiment: form.sentiment,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        postedAt: new Date(form.postedAt).toISOString(),
      });
      setForm(emptyForm);
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New mention</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
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
            <Textarea required value={form.body} onChange={(e) => set({ body: e.target.value })} rows={4} />
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
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={create.isPending}>Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
