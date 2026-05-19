import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandFormDialog } from './BrandFormDialog';
import { useDeleteBrand } from './hooks';

export function BrandTable({ brands }) {
  const del = useDeleteBrand();
  const [editing, setEditing] = useState(null);

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Keywords</th>
              <th className="px-4 py-2 text-right">Mentions</th>
              <th className="px-4 py-2 w-px"></th>
            </tr>
          </thead>
          <tbody>
            {brands.map((b) => (
              <tr key={b._id} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">
                  <Link to={`/brands/${b._id}/dashboard`} className="hover:underline">
                    {b.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {(b.keywords ?? []).join(', ') || '—'}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{b.mentionCount}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <Button variant="ghost" size="icon" onClick={() => setEditing(b)} title="Edit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Delete"
                    onClick={() => {
                      if (confirm(`Delete brand "${b.name}" and all its mentions?`)) {
                        del.mutate(b._id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {brands.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                  No brands yet. Click "New brand" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <BrandFormDialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)} initial={editing} />
    </>
  );
}
