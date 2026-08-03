import { AxiosError } from 'axios';

/**
 * Lấy thông điệp lỗi thật từ response.
 *
 * HRM biết chính xác vì sao nó từ chối một đơn (hết quota, quá hạn, trùng giờ,
 * quy tắc riêng của phòng ban). Ta không đoán lại — hiển thị nguyên văn cho
 * người dùng, `fallback` chỉ dùng khi response không có gì để đọc.
 */
export function extractErrorMessage(err: unknown, fallback: string): string {
  const payload = err instanceof AxiosError ? err.response?.data : null;

  if (payload && typeof payload === 'object') {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
    // Một số endpoint trả mảng message (class-validator).
    if (Array.isArray(message) && message.length > 0) {
      return message.filter((item) => typeof item === 'string').join('. ');
    }
  }

  return err instanceof Error && err.message ? err.message : fallback;
}
