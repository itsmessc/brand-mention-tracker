import { useState } from 'react';
import { NavLink, Outlet, useParams, Link } from 'react-router-dom';
import { ChevronLeft, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImportDialog } from '@/features/mentions/ImportDialog';
import { useBrand } from '@/features/brands/hooks';
import { cn } from '@/lib/utils';

export default function BrandLayout() {
  const { brandId } = useParams();
  const { data: brand, isLoading } = useBrand(brandId);
  const [importing, setImporting] = useState(false);

  return (
    <div>
      <div className="mb-4">
        <Link to="/" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" /> All brands
        </Link>
      </div>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{isLoading ? '…' : brand?.name}</h1>
          {brand?.keywords?.length > 0 && (
            <p className="text-sm text-muted-foreground">Keywords: {brand.keywords.join(', ')}</p>
          )}
        </div>
        <Button variant="outline" onClick={() => setImporting(true)}>
          <Upload className="h-4 w-4" /> Import mentions
        </Button>
      </div>

      <nav className="flex gap-1 border-b border-border mb-6">
        <Tab to={`/brands/${brandId}/dashboard`}>Dashboard</Tab>
        <Tab to={`/brands/${brandId}/mentions`}>Mentions</Tab>
      </nav>

      <Outlet />

      <ImportDialog open={importing} onOpenChange={setImporting} brandId={brandId} />
    </div>
  );
}

function Tab({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
          isActive
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground hover:text-primary'
        )
      }
    >
      {children}
    </NavLink>
  );
}
