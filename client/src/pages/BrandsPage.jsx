import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBrands } from '@/features/brands/hooks';
import { BrandTable } from '@/features/brands/BrandTable';
import { BrandFormDialog } from '@/features/brands/BrandFormDialog';

export default function BrandsPage() {
  const { data: brands, isLoading, error } = useBrands();
  const [creating, setCreating] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Brands</h1>
          <p className="text-sm text-muted-foreground">Track mentions for each brand you care about.</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> New brand
        </Button>
      </div>

      {isLoading && <div className="text-muted-foreground">Loading…</div>}
      {error && <div className="text-destructive">{error.message}</div>}
      {brands && <BrandTable brands={brands} />}

      <BrandFormDialog open={creating} onOpenChange={setCreating} />
    </div>
  );
}
