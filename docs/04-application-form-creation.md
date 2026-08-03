# Tạo đơn từ

Dialog mở từ panel chi tiết ngày.

| File | Vai trò |
|---|---|
| `frontend/components/timesheet/CreateApplicationFormDialog.tsx` | giao diện |
| `frontend/hooks/use-create-application-form.ts` | state, gọi API |
| `shared/src/rules.ts` | tính cảnh báo |

## Nguyên tắc: cảnh báo, không chặn

**HRM là nơi quyết định đơn có hợp lệ hay không.** Nó biết những thứ ta không biết: đơn ở tháng khác, cấu hình riêng của phòng ban, ngoại lệ do quản lý duyệt.

Ta đoán sai mà **chặn** → người dùng không làm được việc.
Ta đoán sai mà **cảnh báo** → họ đọc thêm một dòng rồi vẫn gửi được.

Nên mọi ràng buộc nghiệp vụ đều hiện dưới dạng cảnh báo vàng, kèm dòng *"Vẫn gửi được — HRM sẽ quyết định"*. Khi HRM từ chối, hiển thị **nguyên văn** lý do của nó.

Chỉ còn hai thứ thuần kỹ thuật là chặn thật, vì gửi đi chắc chắn hỏng:

- giờ kết thúc không sau giờ bắt đầu
- chưa chọn đủ người duyệt

> Bản cũ chặn theo suy đoán, mà suy đoán lại **lệch với chính phần auto-create của
> nó**: auto-create chấp nhận điều kiện "về muộn bù giờ", còn hàm validate thì
> không — nên tool tự sinh ra đơn mà nếu người dùng tạo tay sẽ bị chặn.

## Năm loại cảnh báo

`checkDraftForm` trả về danh sách, tất cả cùng mức:

| Mã | Khi nào |
|---|---|
| `reason-week-limit` | tuần đã dùng hết số lần cho phép của lý do đó |
| `reason-minutes-limit` | đơn dài quá `maxMinutesInDay` của lý do |
| `submission-deadline` | quá hạn nộp tính từ ngày áp dụng |
| `insufficient-work-hours` | ngày đó có thể chưa đủ giờ làm |
| `overlapping-form` | trùng giờ với đơn đã có trong ngày |

Mọi ngưỡng đọc từ HRM (`reasonLimits`, `maxDaysAfterByType`), không hardcode. Xem [02-timesheet-calendar.md](./02-timesheet-calendar.md#2-ràng-buộc-nghiệp-vụ-là-dữ-liệu-không-phải-hằng-số).

Đơn kề nhau **không** tính là trùng: đơn cũ `08:30–08:45` và đơn mới `08:45–09:00` là hợp lệ. Mốc giờ của đơn checkin/out cũng không tính là trùng khoảng, vì nó là một điểm chứ không phải khoảng.

## Gợi ý khoảng giờ

Khi mở dialog, `suggestIntervalForDay` điền sẵn khoảng giờ: lấy chiều vi phạm nặng hơn, rồi lấy **khoảng trống đầu tiên chưa bị đơn nào chiếm**.

Nhờ vậy mở dialog lần thứ hai sẽ đề xuất khoảng nối tiếp, không lặp lại khoảng đã có đơn.

## Payload gửi HRM

Shape khác nhau theo loại đơn — HRM không thống nhất, ta phải chiều:

```ts
// Đơn xin nghỉ (typeId 1)
{ dateStart, dateEnd, timeStart, timeEnd, reasonId }

// Đơn vắng mặt và các loại khác
{ date, timeStart, timeEnd, reasonId }
```

## Người duyệt

Số lượng lấy từ `type.orderMax`. Danh sách lấy từ `/application/approval-assignments`.

Lựa chọn được ghi nhớ qua `/application/approver-preferences` (lưu ở DB của hệ thống này, không phải HRM) và tự điền cho lần sau. Ghi nhớ hỏng thì bỏ qua — đó chỉ là tiện lợi, không đáng làm hỏng luồng tạo đơn.

Xem thêm: [06-approver-settings.md](./06-approver-settings.md)
