import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Chào mừng đến với KaopizEX - Hệ thống công cụ nội bộ của Kaopiz!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
