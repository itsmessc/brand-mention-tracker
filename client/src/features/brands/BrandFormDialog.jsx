import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateBrand, useUpdateBrand } from './hooks';

export function BrandFormDialog({ open, onOpenChange, initial }) {
  const create = useCreateBrand();
  const update = useUpdateBrand();
  const isEdit = !!initial?._id;

  const [name, setName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? '');
      setKeywords((initial?.keywords ?? []).join(', '));
      setError(null);
    }
  }, [open, initial]);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    const payload = {
      name: name.trim(),
      keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
    };
    try {
      if (isEdit) await update.mutateAsync({ id: initial._id, data: payload });
      else await create.mutateAsync(payload);
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit brand' : 'New brand'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label>Keywords (comma separated)</Label>
            <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="acme, acme corp" />
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={create.isPending || update.isPending}>
              {isEdit ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
