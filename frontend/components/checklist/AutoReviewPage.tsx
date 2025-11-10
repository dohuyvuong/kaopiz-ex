'use client';

import { useState } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { checklistApi } from '@/lib/api/checklist';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChecklistPreviewTable } from './ChecklistPreviewTable';
import { Play, Eye } from 'lucide-react';

export function AutoReviewContent() {
  const { token } = useAppSelector((state) => state.auth);
  const [maxReviews, setMaxReviews] = useState<number>(10);
  const [projectName, setProjectName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<{
    maxReviews: number;
    projectName: string;
  } | null>(null);

  const handleAutoReview = async () => {
    if (!token) {
      setError('Chưa đăng nhập');
      return;
    }

    if (!maxReviews || maxReviews < 1) {
      setError('Số lượng checklist phải lớn hơn 0');
      return;
    }

    if (!projectName.trim()) {
      setError('Tên project không được để trống');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const result = await checklistApi.autoReview(token, {
        maxReviews,
        projectName: projectName.trim(),
      });

      setSuccess(
        `Đã hoàn thành tự động review: ${result.success}/${result.total} checklist thành công. ${result.failed > 0 ? `Có ${result.failed} checklist thất bại.` : ''}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi thực hiện auto review');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!token) {
      setError('Chưa đăng nhập');
      return;
    }

    if (!maxReviews || maxReviews < 1) {
      setError('Số lượng checklist phải lớn hơn 0');
      return;
    }

    if (!projectName.trim()) {
      setError('Tên project không được để trống');
      return;
    }

    try {
      setPreviewLoading(true);
      setError(null);
      setPreviewData({
        maxReviews,
        projectName: projectName.trim(),
      });
      setShowPreview(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Auto Review Checklist</CardTitle>
          <CardDescription>
            Tự động submit checklist review với các tham số tùy chỉnh
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maxReviews">Số lượng checklist tối đa</Label>
              <Input
                id="maxReviews"
                type="number"
                min="1"
                value={maxReviews}
                onChange={(e) => setMaxReviews(Number(e.target.value))}
                placeholder="Nhập số lượng checklist tối đa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectName">Tên project</Label>
              <Input
                id="projectName"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Nhập tên project (ví dụ: DECAL_16)"
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                {success}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleAutoReview}
                disabled={loading || previewLoading}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                {loading ? 'Đang xử lý...' : 'Chạy tự động'}
              </Button>
              <Button
                onClick={handlePreview}
                disabled={loading || previewLoading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {previewLoading ? 'Đang tải...' : 'Preview danh sách'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showPreview && previewData && (
        <Card>
          <CardHeader>
            <CardTitle>Preview danh sách checklist</CardTitle>
            <CardDescription>
              Danh sách checklist sẽ được review (tối đa {previewData.maxReviews} items, project: {previewData.projectName})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChecklistPreviewTable
              maxReviews={previewData.maxReviews}
              projectName={previewData.projectName}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
