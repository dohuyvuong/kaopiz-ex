/**
 * Logic nghiệp vụ chấm công — dùng chung cho frontend (màn calendar) và backend
 * (cron tự động tạo đơn). Thuần TypeScript, không phụ thuộc React hay NestJS,
 * không gọi API: mọi dữ liệu vào ra đều qua tham số.
 *
 * Đặt ở đây thay vì mỗi bên một bản để hai nơi không thể tính ra hai kết quả
 * khác nhau cho cùng một tháng.
 */

export * from './types';
export * from './normalize';
export * from './estimate';
export * from './rules';
export * from './suggest';
