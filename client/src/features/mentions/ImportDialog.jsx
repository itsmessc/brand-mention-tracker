import { useState } from 'react';
import Papa from 'papaparse';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBulkIngest } from './hooks';

export function ImportDialog({ open, onOpenChange, brandId }) {
  const ingest = useBulkIngest(brandId);
  const [json, setJson] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function reset() {
    setJson('');
    setFile(null);
    setResult(null);
    setError(null);
  }

  async function submitJson() {
    setError(null);
    setResult(null);
    let items;
    try {
      items = JSON.parse(json);
      if (!Array.isArray(items)) throw new Error('Must be a JSON array');
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
      return;
    }
    try {
      const r = await ingest.mutateAsync({ items });
      setResult(r);
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitCsv() {
    if (!file) {
      setError('Choose a CSV file');
      return;
    }
    setError(null);
    setResult(null);
    try {
      const r = await ingest.mutateAsync({ file });
      setResult(r);
    } catch (err) {
      setError(err.message);
    }
  }

  function onPickFile(e) {
    const f = e.target.files?.[0];
    setFile(f ?? null);
    setError(null);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import mentions</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="csv">
          <TabsList>
            <TabsTrigger value="csv">CSV upload</TabsTrigger>
            <TabsTrigger value="json">JSON paste</TabsTrigger>
          </TabsList>

          <TabsContent value="csv" className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Required columns: <code>source, body, postedAt</code>. Optional:{' '}
              <code>author, url, externalId, sentiment, tags</code>. Tags can be{' '}
              <code>|</code>-, <code>,</code>- or <code>;</code>-separated.
            </p>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={onPickFile}
              className="block text-sm"
            />
            {file && <FilePreview file={file} />}
            <div className="flex justify-end">
              <Button onClick={submitCsv} disabled={!file || ingest.isPending}>
                Upload
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="json" className="space-y-3">
            <Label>JSON array</Label>
            <Textarea
              rows={10}
              value={json}
              onChange={(e) => setJson(e.target.value)}
              placeholder='[{"source":"twitter","body":"...","postedAt":"2024-01-01T00:00:00Z"}]'
            />
            <div className="flex justify-end">
              <Button onClick={submitJson} disabled={ingest.isPending}>
                Ingest
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {error && <div className="text-sm text-destructive mt-3">{error}</div>}
        {result && (
          <div className="mt-3 rounded-md border border-border bg-muted/40 p-3 text-sm">
            <div><strong>Total rows:</strong> {result.total}</div>
            <div><strong>Added:</strong> {result.added}</div>
            <div><strong>Skipped (duplicates):</strong> {result.skippedDuplicates}</div>
            <div><strong>Failed:</strong> {result.failed.length}</div>
            {result.failed.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer">Show failures</summary>
                <pre className="mt-2 text-xs max-h-40 overflow-auto">
                  {JSON.stringify(result.failed.slice(0, 20), null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FilePreview({ file }) {
  const [count, setCount] = useState(null);
  // Parse just to count rows for the user's reassurance.
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (r) => setCount(r.data.length),
  });
  return (
    <div className="text-xs text-muted-foreground">
      {file.name}
      {count != null && ` · ${count} rows`}
    </div>
  );
}
