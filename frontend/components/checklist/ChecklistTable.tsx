'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { checklistApi, CodeReview } from '@/lib/api/checklist';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ExternalLink, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export function ChecklistTable() {
  const appToken = useAuthStore((state) => state.appToken);
  const [reviews, setReviews] = useState<CodeReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(10);

  const fetchReviews = async (page: number = 1, itemsPerPage: number = perPage) => {
    if (!appToken) {
      setError('Chưa đăng nhập với Ksystem. Vui lòng đăng nhập bằng Microsoft SSO.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await checklistApi.getMyPendingReviews({
        page,
        perPage: itemsPerPage,
      });
      setReviews(response.data);
      setCurrentPage(response.currentPage);
      setTotalPages(response.lastPage);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tải danh sách');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1, perPage);
  }, [appToken, perPage]);

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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Checklist Review</CardTitle>
              <CardDescription>
                Danh sách các checklist review đang chờ bạn review ({total} items)
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchReviews(currentPage)}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Không có checklist review nào đang chờ bạn review
            </div>
          ) : (
            <>
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
                            {review.jiraUrl && (
                              <Link
                                href={review.jiraUrl}
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
                            {formatDate(review.createdAt)}
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

              {/* Pagination */}
              <div className="flex flex-col xl:flex-row justify-center mt-4 gap-4">
                <div className="flex flex-1 justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    <span className="hidden sm:inline">
                      Hiển thị {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, total)} trong tổng số {total} items
                    </span>
                    <span className="sm:hidden">
                      {((currentPage - 1) * perPage) + 1}-{Math.min(currentPage * perPage, total)} / {total}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <span className="text-sm text-muted-foreground">Rows per page:</span>
                    <Select
                      value={String(perPage)}
                      onValueChange={(value) => {
                        const newPerPage = Number(value);
                        setPerPage(newPerPage);
                        setCurrentPage(1); // Reset về trang đầu khi thay đổi perPage
                        fetchReviews(1, newPerPage);
                      }}
                    >
                      <SelectTrigger className="w-[70px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center gap-4">
                    <Pagination>
                        <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (currentPage > 1 && !loading) {
                                fetchReviews(currentPage - 1);
                                }
                            }}
                            className={currentPage === 1 || loading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                        </PaginationItem>
                        {(() => {
                            const pages: (number | 'ellipsis')[] = [];

                            // Luôn hiển thị trang đầu
                            pages.push(1);

                            // Thêm ellipsis nếu cần
                            if (currentPage > 3) {
                            pages.push('ellipsis');
                            }

                            // Thêm các trang xung quanh trang hiện tại
                            const start = Math.max(2, currentPage - 1);
                            const end = Math.min(totalPages - 1, currentPage + 1);

                            for (let i = start; i <= end; i++) {
                            if (i !== 1 && i !== totalPages) {
                                pages.push(i);
                            }
                            }

                            // Thêm ellipsis nếu cần
                            if (currentPage < totalPages - 2) {
                            pages.push('ellipsis');
                            }

                            // Luôn hiển thị trang cuối (nếu có nhiều hơn 1 trang)
                            if (totalPages > 1) {
                            pages.push(totalPages);
                            }

                            // Loại bỏ duplicate
                            const uniquePages = pages.filter((page, index, self) => {
                            if (page === 'ellipsis') {
                                return index === 0 || self[index - 1] !== 'ellipsis';
                            }
                            return index === self.indexOf(page);
                            });

                            return uniquePages.map((page, index) => {
                            if (page === 'ellipsis') {
                                return (
                                <PaginationItem key={`ellipsis-${index}`}>
                                    <PaginationEllipsis />
                                </PaginationItem>
                                );
                            }
                            return (
                                <PaginationItem key={page}>
                                <PaginationLink
                                    href="#"
                                    onClick={(e) => {
                                    e.preventDefault();
                                    if (page !== currentPage && !loading) {
                                        fetchReviews(page);
                                    }
                                    }}
                                    isActive={page === currentPage}
                                    className={page === currentPage ? '' : 'cursor-pointer'}
                                >
                                    {page}
                                </PaginationLink>
                                </PaginationItem>
                            );
                            });
                        })()}
                        <PaginationItem>
                            <PaginationNext
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (currentPage < totalPages && !loading) {
                                fetchReviews(currentPage + 1);
                                }
                            }}
                            className={currentPage === totalPages || loading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                        </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
