# Timesheet Calendar

## Nguyên tắc thiết kế

Ba điều chi phối toàn bộ module này. Hiểu ba điều này thì phần còn lại tự suy ra được.

### 1. HRM đã tính sẵn, ta không tính lại

`minutesLate` / `minutesEarly` mà HRM trả về **đã trừ các đơn ĐÃ DUYỆT**. Kết quả cũng được phản ánh vào `timeInFinal` / `timeOutFinal` — giờ vào/ra sau khi áp đơn.

Ví dụ ngày 02/07/2026: chấm công vào lúc `08:53` (đáng lẽ muộn 23 phút), nhưng có đơn vắng mặt đã duyệt che `08:30–08:53` → HRM trả `timeInFinal: "08:30"`, `minutesLate: 0`.

Việc duy nhất của ta là ước tính thêm phần các đơn **CHỜ DUYỆT** sẽ che được.

### 2. Ràng buộc nghiệp vụ là dữ liệu, không phải hằng số

| Ràng buộc | Nguồn |
|---|---|
| 90 phút miễn phạt mỗi tháng | `workingTime.minutesEarlyLateAllowed` |
| 8 tiếng/ngày | `workingTime.workingHoursPerDay` |
| Nghỉ trưa 60 phút | `workingTime.lunchBreakTime` |
| 2 lần/tuần cho lý do 21 | `reasons[21].data.maxTimesInWeek` |
| 60 phút/lần cho lý do 21 | `reasons[21].data.maxMinutesInDay` |
| Hạn nộp đơn | `applicationFormConfig.types[].maxDaysAfter` |

Không hardcode con số nào. HRM đổi rule thì tool tự đúng theo.

### 3. Hình học quyết định, không phải loại đơn

Phần vi phạm còn lại của một ngày luôn nằm gọn trong hai cửa sổ:

```
[workStart → timeInFinal]     ← phần đi muộn
[timeOutFinal → workEnd]      ← phần về sớm
```

Một đơn chờ duyệt che được bao nhiêu phút = **phần nó giao với cửa sổ đó**.

Nhờ vậy không cần bảng tra "loại đơn nào ảnh hưởng chấm công". Đơn nghỉ, đơn vắng mặt, đơn checkin/out đều xử lý bằng cùng một công thức, và loại đơn mới xuất hiện trong tương lai cũng tự đúng.

## Kiến trúc

```
package @kaopiz/timesheet  (shared/)      ← thuần TS, không React, không NestJS
├── types.ts       CalendarDay, DayForm, TimesheetRules
├── normalize.ts   response HRM → model
├── estimate.ts    ước tính sau khi duyệt đơn chờ
├── rules.ts       cảnh báo khi tạo đơn
└── suggest.ts     đề xuất đơn cần tạo
        ▲                              ▲
        │                              │
frontend/hooks/use-timesheet-calendar   backend/timesheet-snapshot.service
        │                              │
   màn calendar                   cron tự động tạo đơn
```

Chỉ phần **tải dữ liệu** là hai bên tự làm. Phần **tính toán** dùng chung, nên UI và cron không thể ra hai kết quả khác nhau cho cùng một tháng.

## Chuẩn hoá dữ liệu HRM

`normalize.ts` tồn tại để hấp thụ ba điểm bất nhất của HRM, giúp phần còn lại chỉ thấy một shape duy nhất.

### Ba shape của `trackingTimes`

| Loại đơn | Shape | Ý nghĩa |
|---|---|---|
| Đơn xin nghỉ (1) | `dateStart`/`dateEnd` + `timeStart`/`timeEnd` | khoảng, có thể nhiều ngày |
| Đơn vắng mặt (2) | `date` + `timeStart`/`timeEnd` | khoảng, một ngày |
| Đơn checkin/out (4) | `date` + `time` | **một mốc giờ**, không phải khoảng |

Mốc giờ của đơn checkin/out là giờ chấm công khai bổ sung. Ví dụ 16/04/2026 chấm ra lúc `13:50`, đơn khai mốc `17:30` → HRM đặt `timeOutFinal: "17:30"`, về sớm về 0.

### `reasonId` nằm ở hai chỗ

Khi thì ở cấp đơn (`data.reasonId`), khi thì trong từng tracking time. `normalizeForm` đọc cả hai.

### Ngày không đi qua timezone

HRM trả `"2026-04-16T00:00:00.000Z"`. Parse bằng `new Date()` rồi format theo giờ địa phương sẽ ra **ngày 15** ở mọi timezone âm. Ngày ở đây là nhãn lịch, không phải một thời điểm — nên `toDateKey` cắt chuỗi.

## Luồng dữ liệu

```
GET /timesheet/calendar?monthYear=MM-YYYY
   → timelines (chỉ đơn ĐÃ DUYỆT) + workingTime + summary + applicationFormConfig
   → normalizeCalendarDay → CalendarDay[]

GET /timesheet/day-detail?date=YYYY-MM-DD   (theo từng ngày cần thiết)
   → applicationForms (có `status`, nên biết đơn nào CHỜ DUYỆT) + timeSheets
   → mergeDayDetailForms

GET /master/all-reasons?type_id_equal=…     (loại 1, 2, 4)
   → buildRules

→ estimateMonth → lưới calendar + tổng hợp tháng
```

### Ngày nào cần gọi day-detail

- Ngày trong tháng **có vi phạm hoặc thiếu chấm công** → có thể đang có đơn chờ duyệt
- Ngày **ngoài tháng** nằm trong lưới → cần để đếm đúng quota đơn theo tuần, vì tuần có thể vắt qua hai tháng

Một cache `Map<date, DayDetail>` duy nhất phục vụ cả lưới lẫn panel chi tiết, nên một ngày không bao giờ bị gọi hai lần.

## Tuần bắt đầu từ thứ Hai

`dayjs().startOf('week')` mặc định là **Chủ nhật** — lệch một ngày so với tuần làm việc và so với chính lưới calendar (T2→CN). `rules.ts` tự tính bằng `startOfWorkWeek`, không dùng dayjs.

Sai chỗ này thì quota "2 đơn/tuần" đếm nhầm tuần.

## Hiển thị

`TimesheetDayCell` hiện đủ ba con số khi có đơn chờ duyệt che một phần:

```
Muộn 35p → 10p
```

Hover: *"muộn 35 phút, đơn chờ duyệt che 25 phút, còn 10 phút"*.

Tổng hợp tháng hiện tổng thực tế, hạn mức, và mức vượt — kèm dòng "nếu duyệt hết đơn chờ" khi có chênh lệch.

## Files

| File | Vai trò |
|---|---|
| `shared/src/*.ts` | logic nghiệp vụ + 52 test trên fixture thật |
| `frontend/hooks/use-timesheet-calendar.ts` | tải dữ liệu, quản lý state |
| `frontend/components/timesheet/TimesheetCalendar.tsx` | lưới + tổng hợp tháng |
| `frontend/components/timesheet/TimesheetDayCell.tsx` | một ô ngày |
| `frontend/components/timesheet/TimesheetDayDetail.tsx` | panel chi tiết |
| `backend/src/timesheet/timesheet-snapshot.service.ts` | dựng dữ liệu đầu vào phía server |

## Test

`shared/src/*.test.ts` chạy trên response **thật** của HRM (`shared/src/__fixtures__/`, rút từ `fixtures/`). Vài mốc được chốt lại:

- Tháng 07/2026: tổng muộn 115 phút, vượt hạn mức 25 phút
- 31/07: muộn 35 phút, đơn chờ duyệt `08:30–08:55` che 25 → còn 10 phút
- 31/07: đơn buổi chiều `15:55–17:30` **không** đụng tới phần muộn buổi sáng
- 16/04: đơn checkin/out mốc `17:30` bù trọn 220 phút về sớm
- Chủ nhật 19/04 thuộc tuần bắt đầu 13/04
