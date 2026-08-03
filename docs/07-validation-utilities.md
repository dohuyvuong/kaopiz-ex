# Hàm tiện ích nghiệp vụ

Toàn bộ nằm trong package `@kaopiz/timesheet` (`shared/src/`), thuần TypeScript, có test. Trước đây rải ở `frontend/lib/utils/application-form.ts` và `auto-create-applications.ts` — hai file đó đã bị xoá, và cùng với chúng là **hai bản `countAbsenceFormsInWeek` có logic khác nhau**.

## `normalize.ts` — chuẩn hoá dữ liệu HRM

| Hàm | Việc |
|---|---|
| `toDateKey(value)` | ISO / Date → `"YYYY-MM-DD"`, **không đi qua timezone** |
| `toMinutes(time)` | `"08:30"` → `510` |
| `toTimeString(minutes)` | `510` → `"08:30"` |
| `normalizeForm(raw, dateKey)` | gộp 3 shape `trackingTimes`, đọc `reasonId` ở cả hai cấp |
| `normalizeCalendarDay(raw)` | một ngày từ `timelines` |
| `mergeDayDetailForms(day, forms)` | gộp đơn chờ duyệt vào ngày đã có |
| `buildRules(input)` | dựng bộ ràng buộc từ `workingTime` + `reasons` + `applicationFormConfig` |

`toDateKey` cắt chuỗi thay vì `new Date().toLocaleDateString()`: HRM trả `"2026-04-16T00:00:00.000Z"`, parse rồi format theo giờ địa phương sẽ ra **ngày 15** ở mọi timezone âm. Ngày ở đây là nhãn lịch, không phải một thời điểm.

## `estimate.ts` — ước tính sau khi duyệt đơn chờ

| Hàm | Trả về |
|---|---|
| `estimateDay(day, rules)` | `{ actual, covered, estimated, hasPendingCoverage }` |
| `estimateMonth(days, rules, actualTotal)` | tổng tháng + `estimatedOverage` |

Cách tính: phần vi phạm còn lại nằm gọn trong `[workStart → timeInFinal]` và `[timeOutFinal → workEnd]`; một đơn che được bao nhiêu = phần nó **giao** với cửa sổ đó.

Không cần biết đơn thuộc loại nào. Xem [02-timesheet-calendar.md](./02-timesheet-calendar.md#3-hình-học-quyết-định-không-phải-loại-đơn).

## `rules.ts` — cảnh báo và ràng buộc

| Hàm | Việc |
|---|---|
| `startOfWorkWeek(dateKey)` | thứ Hai của tuần chứa ngày đó |
| `workWeekDates(dateKey)` | 7 ngày T2 → CN |
| `daysBetween(from, to)` | số ngày giữa hai nhãn ngày |
| `countReasonUsageInWeek(...)` | đếm số lần đã dùng một lý do trong tuần |
| `hasEnoughWorkHours(day, rules)` | đủ giờ làm cho lý do 21 chưa |
| `intervalsOverlap(a, b)` | hai khoảng có giao nhau không |
| `checkDraftForm(draft, context)` | danh sách cảnh báo cho một đơn sắp tạo |

**`startOfWorkWeek` tự tính, không dùng `dayjs().startOf('week')`** — mặc định của dayjs là Chủ nhật, lệch một ngày so với tuần làm việc và so với chính lưới calendar (T2→CN). Sai chỗ này thì quota "2 đơn/tuần" đếm nhầm tuần.

`checkDraftForm` nhận `today` qua tham số thay vì gọi `new Date()` — để test được mà không cần giả lập đồng hồ.

## `suggest.ts` — đề xuất đơn

| Hàm | Việc |
|---|---|
| `suggestForms(options)` | danh sách đơn cần tạo để về dưới hạn mức |
| `suggestIntervalForDay(day, rules)` | khoảng giờ điền sẵn khi mở form tạo đơn |

Chi tiết thuật toán: [05-auto-create-applications.md](./05-auto-create-applications.md)

## Test

`shared/src/*.test.ts` — 52 test chạy trên response **thật** của HRM, fixture ở `shared/src/__fixtures__/` (rút từ `fixtures/`).

```bash
cd shared && yarn test
```

Chạy tự động trong CI trước cả lint của backend và frontend.
