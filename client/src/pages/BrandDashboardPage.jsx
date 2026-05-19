import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboard } from '@/features/dashboard/hooks';
import { SentimentChart } from '@/features/dashboard/SentimentChart';
import { SourceChart } from '@/features/dashboard/SourceChart';
import { PerDayChart } from '@/features/dashboard/PerDayChart';
import { TopTagsList } from '@/features/dashboard/TopTagsList';

export default function BrandDashboardPage() {
  const { brandId } = useParams();
  const { data, isLoading, error } = useDashboard(brandId);

  if (isLoading) return <div className="text-muted-foreground">Loading…</div>;
  if (error) return <div className="text-destructive">{error.message}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total mentions" value={data.total} />
        <StatCard label="Positive" value={countOf(data.bySentiment, 'positive')} />
        <StatCard label="Neutral" value={countOf(data.bySentiment, 'neutral')} />
        <StatCard label="Negative" value={countOf(data.bySentiment, 'negative')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Sentiment</CardTitle></CardHeader>
          <CardContent><SentimentChart data={data.bySentiment} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Sources</CardTitle></CardHeader>
          <CardContent><SourceChart data={data.bySource} /></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Mentions per day (last 30)</CardTitle></CardHeader>
          <CardContent><PerDayChart data={data.perDay} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Top tags</CardTitle></CardHeader>
          <CardContent><TopTagsList data={data.topTags} /></CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="text-xs uppercase text-muted-foreground tracking-wide">{label}</div>
        <div className="text-2xl font-bold mt-1 tabular-nums">{value.toLocaleString()}</div>
      </CardContent>
    </Card>
  );
}

function countOf(arr, key) {
  return arr.find((x) => x.sentiment === key)?.count ?? 0;
}
