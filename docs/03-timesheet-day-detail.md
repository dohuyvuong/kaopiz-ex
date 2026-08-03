# Chi tiết ngày chấm công

Panel bên phải khi bấm vào một ô trong lưới calendar.

**File**: `frontend/components/timesheet/TimesheetDayDetail.tsx`

## Dữ liệu vào

Component này **không tự gọi API**. Toàn bộ dữ liệu nhận qua props từ `useTimesheetCalendar`:

| Prop | Nguồn |
|---|---|
| `day: CalendarDay` | đã gộp đơn đã duyệt (calendar) + đơn chờ duyệt (day-detail) |
| `detail: TimesheetDayDetailResponse` | để lấy `timeSheets` — danh sách lần quẹt máy |
| `estimate: DayEstimate` | số phút vi phạm, số phút đơn chờ che được, số còn lại |
| `rules`, `daysByDate`, `today` | truyền tiếp cho dialog tạo đơn |

> Bản cũ tự gọi `/timesheet/day-detail` qua một hook riêng, trong khi hook calendar
> cũng đã gọi đúng ngày đó để trộn vào lưới — **mỗi ngày bị gọi hai lần**. Giờ hook
> calendar giữ một cache `Map<date, DayDetail>` dùng chung.

## Bố cục

**Thông tin chấm công** — giờ vào / giờ ra. Nếu `timeInFinal` khác `timeIn` thì hiện thêm dòng "Sau khi áp đơn: 08:30", cho thấy đơn đã duyệt đã đổi giờ tính công.

**Đi muộn / về sớm** — hiện đủ ba con số khi có đơn chờ duyệt che một phần:

> Đi muộn: 35 phút — đơn chờ duyệt che **25** phút, còn **10** phút

**Danh sách lần quẹt máy** — từ `detail.timeSheets`, thu gọn trong accordion.

**Work log** — nếu ngày đó có log.

**Đơn từ** — **một danh sách duy nhất**, đơn đã duyệt và chờ duyệt cùng chỗ, phân biệt bằng badge.

> Bản cũ hiển thị hai danh sách (một từ day-detail, một từ calendar) rồi lọc trùng
> theo `id` — cùng một tập dữ liệu, dựng hai lần, dễ lệch.

Mỗi đơn hiện khoảng giờ hoặc mốc giờ tuỳ loại:

- đơn nghỉ / vắng mặt → `08:30 – 08:55`
- đơn checkin/out → `bổ sung mốc 17:30`

## Xoá đơn

Có dialog xác nhận. Nếu HRM từ chối, hiển thị **nguyên văn lý do** của HRM qua `extractErrorMessage` — nó biết vì sao (quá hạn, đơn đã vào kỳ chốt công, quyền hạn), ta thì không.

## Sau khi tạo hoặc xoá đơn

Gọi `onChanged(date)` → `refreshDate` trong hook: xoá cache của đúng ngày đó rồi tải lại calendar. **Panel không đóng.**

> Bản cũ phải đóng panel, `await onReload()`, rồi `setTimeout(…, 0)` để mở lại — vì
> trạng thái nằm rải ở nhiều nơi nên mở lại sớm sẽ đọc phải dữ liệu cũ. Gộp state
> về một chỗ thì vấn đề biến mất, không cần né nữa.

## Ngày ngoài tháng

Bấm được. Panel lấy dữ liệu từ day-detail API nên không phụ thuộc ngày đó có nằm trong `timelines` của tháng đang xem hay không.
