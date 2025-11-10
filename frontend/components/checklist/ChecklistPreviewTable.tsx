'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { checklistApi, CodeReview } from '@/lib/api/checklist';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface ChecklistPreviewTableProps {
  maxReviews: number;
  projectName: string;
}

export function ChecklistPreviewTable({
  maxReviews,
  projectName,
}: ChecklistPreviewTableProps) {
  const { token } = useAppSelector((state) => state.auth);
  const [reviews, setReviews] = useState<CodeReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchPreview = async () => {
      if (!token) {
        setError('Chưa đăng nhập');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await checklistApi.getMyPendingReviews(token, {
          projectName,
          perPage: maxReviews,
          page: 1,
        });
        // Chỉ lấy số lượng tối đa theo maxReviews
        const limitedReviews = response.data.slice(0, maxReviews);
        setReviews(limitedReviews);
        setTotal(response.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi khi tải danh sách');
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [token, maxReviews, projectName]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 3:
        return <Badge variant="default">Đã self-review</Badge>;
      default:
        return <Badge variant="secondary">Status {status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
        {error}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Không có checklist review nào phù hợp với điều kiện
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Hiển thị {reviews.length} / {total} checklist phù hợp (tối đa {maxReviews} items)
      </div>
      <div className="overflow-x-auto">
        <div className="overflow-hidden rounded-lg border">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="hover:bg-muted/50">
                <TableHead className="bg-muted/50">ID</TableHead>
                <TableHead className="bg-muted/50">Project</TableHead>
                <TableHead className="bg-muted/50">Description</TableHead>
                <TableHead className="bg-muted/50">Author</TableHead>
                <TableHead className="bg-muted/50">Tags</TableHead>
                <TableHead className="bg-muted/50">Status</TableHead>
                <TableHead className="bg-muted/50">Created At</TableHead>
                <TableHead className="bg-muted/50">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium">{review.id}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{review.project.name}</div>
                      <div className="text-xs text-gray-500">{review.project.code}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-md truncate" title={review.description}>
                      {review.description}
                    </div>
                    {review.jira_url && (
                      <Link
                        href={review.jira_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        JIRA
                      </Link>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{review.author.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {review.tags.map((tag) => (
                        <Badge key={tag.id} variant="outline" className="text-xs">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(review.status)}</TableCell>
                  <TableCell className="text-sm">
                    {formatDate(review.created_at)}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/checklist-review/pending/${review.id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Xem chi tiết
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
