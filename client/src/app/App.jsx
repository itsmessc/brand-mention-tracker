import { Link, Route, Routes, Navigate } from 'react-router-dom';
import BrandsPage from '@/pages/BrandsPage';
import BrandLayout from '@/pages/BrandLayout';
import BrandDashboardPage from '@/pages/BrandDashboardPage';
import BrandMentionsPage from '@/pages/BrandMentionsPage';

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">
          <Link to="/" className="font-semibold text-lg">
            Sanrove · Mention Tracker
          </Link>
          <nav className="ml-auto text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Brands</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <Routes>
          <Route path="/" element={<BrandsPage />} />
          <Route path="/brands/:brandId" element={<BrandLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<BrandDashboardPage />} />
            <Route path="mentions" element={<BrandMentionsPage />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}
