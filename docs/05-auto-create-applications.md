# Tự động tạo đơn

## Bài toán

HRM phạt theo **tổng đi muộn + về sớm của cả tháng**, có hạn mức miễn phạt (`workingTime.minutesEarlyLateAllowed`, hiện là 90 phút). Vượt hạn mức thì bị phạt tiền.

Mục tiêu: giữ tổng dưới hạn mức với **chi phí thấp nhất cho người dùng** — tận
dụng hết thứ miễn phí trước, chỉ tiêu phép năm cho phần bắt buộc.

## Thứ tự ưu tiên theo chi phí

**1. Đơn vắng mặt — lý do 21 "Thay đổi thời gian làm việc"**

Không tốn phép năm. Giới hạn đọc từ `/master/all-reasons`:

- `maxTimesInWeek: 2` — 2 lần mỗi tuần (thứ Hai → Chủ nhật)
- `maxMinutesInDay: 60` — 60 phút mỗi ngày
- Ngày đó phải đủ giờ làm

Đây là **quyền lợi cấp theo tuần và hết hạn**, không phải trần cần né. Không dùng
là mất: hạn nộp đơn chỉ vài ngày nên quota của tuần đã qua không lấy lại được.
Vì vậy thuật toán **dùng tối đa quota mỗi tuần**, kể cả khi tháng chưa vượt hạn
mức phạt — phần dư ra là đệm cho những ngày đi muộn phát sinh về sau.

**2. Đơn xin nghỉ — lý do 4 "Nghỉ phép năm"**

Không giới hạn số lần nhưng **tốn phép năm**. Ngược với vòng 1: chỉ tạo **đúng
phần còn vượt hạn mức** sau khi đã trừ đơn vắng mặt, không tiêu trước phòng xa.

> Từng có lúc thuật toán dừng cả hai vòng ngay khi đủ che phần vượt, với lý do
> "mỗi đơn đều tốn công người duyệt". Đó là đánh đổi sai: công người duyệt là chi
> phí tưởng tượng, còn quota tuần bị bỏ phí là mất mát có thật, quy ra phép năm
> phải tiêu ở những tháng sau.

## Điều kiện đủ giờ làm

Lý do 21 có tên đầy đủ là *"Thay đổi thời gian làm việc (Vẫn đảm bảo đủ 8 tiếng)"*. `hasEnoughWorkHours` chấp nhận theo hai cách, chỉ cần thoả một:

- Giờ làm hiệu quả `(timeOut − timeIn − nghỉ trưa)` đạt đủ định mức, **hoặc**
- Về muộn bù đủ số phút đã đi muộn: `timeOut − workEnd ≥ minutesLate`

Ví dụ 31/07/2026: muộn 35 phút — nặng nhất tháng — nhưng ra về lúc `15:55`. Giờ hiệu quả là 5h50, và về sớm nên không bù được. **Không đủ điều kiện** cho lý do 21, phải dùng phép năm.

## Cửa sổ gợi ý: chỉ những ngày còn nộp đơn được

Hạn nộp đơn cho một ngày là **7 ngày** (`max_days_after: 6` + chính ngày đó).
Đây là chỗ phần **gợi ý** khác phần **tạo tay**:

| | Tạo tay | Gợi ý tự động |
|---|---|---|
| Quá hạn nộp | cảnh báo, vẫn gửi được | **không đưa vào danh sách** |

Người dùng tự tạo thì có thể có lý do ta không biết, nên chỉ cảnh báo. Còn gợi ý
một ngày chắc chắn không nộp được đơn thì chỉ làm nhiễu.

**Ngày hôm nay** chỉ được gợi ý khi **ca làm đã kết thúc** — có lần chấm công sau
giờ tan ca. Đang giữa ngày thì số phút về sớm chưa chốt: ở lại thêm là tự hết, làm
đơn lúc này là phí một suất quota tuần. Ngày tương lai không bao giờ được gợi ý.

Hệ quả: đứng ở ngày 03/08 nhìn tháng 7, chỉ 31/07 còn trong hạn — các ngày đầu
tháng dù còn vi phạm cũng không thể xử lý được nữa. Đây là lý do cron chạy **hằng
ngày** thay vì cuối tháng.

## Sửa lại trước khi tạo

Đề xuất của máy chỉ là điểm khởi đầu. Mỗi dòng trong dialog có hai ô giờ sửa
được, số phút tự tính lại theo. Giờ không hợp lệ (kết thúc không sau bắt đầu) thì
chặn gửi — đây là lỗi kỹ thuật, không phải rule HRM.

## Không đề xuất chồng lên đơn sẵn có

Khoảng giờ đề xuất được tính bằng cách **trừ đi phần đã bị đơn khác chiếm** trong cửa sổ vi phạm.

Nhờ vậy hai đơn trong cùng một ngày nối tiếp nhau thay vì chồng lên nhau — ví dụ xin đi muộn `08:30–09:30` rồi xin nghỉ tiếp `09:30–10:00`. Đây là tình huống HRM cho phép và người dùng thực tế có dùng.

## Mỗi đề xuất tự nói nó che gì

`SuggestedForm` có trường `covers: 'late' | 'early'`.

> Bản cũ suy ngược điều này bằng cách dò chữ trong câu mô tả tiếng Việt (`description.includes('đi muộn')`), và dò **sai** vì đơn vắng mặt sinh ra mô tả viết hoa `"Đi muộn 40 phút"`. Hệ quả: preview "sau khi duyệt" hiển thị sai số.

## Ví dụ đầy đủ — tháng 07/2026

Dữ liệu thật từ `fixtures/`. Tổng muộn 115 phút, hạn mức 90 → cần che **25 phút**.

Các ngày muộn, sắp theo mức độ: 31/07 (35p), 13/07 (17p), 16/07 (13p), 01/07 (12p), 14/07 (12p), 08/07 (10p)…

| Ngày | Kết quả | Vì sao |
|---|---|---|
| 31/07 (35p) | ❌ đơn vắng mặt | ra về 15:55, không đủ 8 tiếng |
| 13/07 (17p) | ❌ | tuần 13–19/07 đã có 2 đơn lý do 21 đã duyệt (15/07, 17/07) — **hết quota** |
| 16/07 (13p) | ❌ | cùng tuần trên, hết quota |
| 14/07 (12p) | ❌ | cùng tuần trên, hết quota |
| **01/07 (12p)** | ✅ đơn vắng mặt `08:30–08:42` | tuần 29/06–05/07 mới dùng 1/2 |
| **31/07** | ✅ nghỉ phép `08:30–08:43` (13p) | phần dư, đặt vào ngày nặng nhất |

Tổng che 25 phút → tháng vừa đúng 90, hết bị phạt.

Ví dụ này cho thấy vì sao "chọn ngày vi phạm nặng nhất" không đủ: quota tuần và điều kiện giờ làm mới là thứ quyết định.

## Ví dụ tháng chưa vượt hạn mức — 04/2026

Tổng 79 phút < 90, **không bị phạt**, nên không cần đơn nghỉ phép nào. Nhưng tuần
30/03–05/04 mới dùng 1/2 quota đơn vắng mặt, và ngày 01/04 muộn 20 phút với giờ
làm đủ điều kiện.

→ Vẫn tạo 1 đơn vắng mặt 20 phút. Tổng tháng xuống **59 phút**, dôi ra 31 phút đệm
cho nửa tháng còn lại. Nếu bỏ qua, quota tuần đó mất hẳn và 20 phút này sẽ chiếm
chỗ trong hạn mức của cả tháng.

## Hai nơi dùng, một logic

| Nơi | Kích hoạt | Đường đi |
|---|---|---|
| Nút "Tự động tạo đơn" | người dùng bấm | `useAutoCreateApplications` → `suggestForms` |
| Cron | 10:00 hằng ngày | `TimesheetSchedulerService` → `TimesheetSnapshotService` → `suggestForms` |

Cùng một hàm trong `@kaopiz/timesheet`, nên hai nơi không thể đề xuất khác nhau.

### Luồng cron

```
cron 10:00
  → user bật job auto-create-forms, token HRM còn hạn
  → TimesheetSnapshotService.build(token, monthYear)   quét TRỌN THÁNG
  → suggestForms
  → PendingAction (payload = SuggestedForm[])
  → thông báo Telegram kèm nút Duyệt / Từ chối
  → người dùng duyệt, hoặc tự duyệt sau N phút
  → executeFormCreation: tra người duyệt, gọi HRM tạo từng đơn
```

Vài điểm đáng lưu ý:

- **Quét trọn tháng, không phải N ngày gần đây.** Vi phạm tính theo tháng nên "7 ngày gần đây" không trả lời được câu "tháng này có vượt hạn mức không". Trước ngày 10 thì quét cả tháng trước, vì tháng trước vẫn còn trong hạn nộp đơn.
- **Chạy hằng ngày là cố ý.** Quota đơn vắng mặt hết hạn theo tuần, nên phải nhắc sớm — đợi tới cuối tháng thì quota các tuần đầu đã mất.
- **Chống gửi trùng.** Cron chạy hằng ngày; đã có pending action chờ xử lý thì bỏ qua.
- **Người duyệt tra lúc thực thi**, không lưu trong payload — từ lúc gửi thông báo tới lúc bấm duyệt có thể vài giờ, đủ để người dùng đổi lựa chọn. Người duyệt đã lưu còn được đối chiếu với `/application/approval-assignments` để bắt trường hợp họ đã nghỉ việc hoặc đổi phòng ban; API đó lỗi thì bỏ qua bước đối chiếu chứ không chặn.
- Một đơn lỗi không chặn các đơn còn lại; hỏng toàn bộ thì ném lỗi thay vì im lặng.

## Giới hạn đã biết

- Ước tính **thận trọng hơn thực tế**. HRM đôi khi rộng lượng hơn: một đơn chạm vào đầu ca có thể miễn toàn bộ phần muộn của ca đó (ngày 20/04/2026, đơn 1 phút `08:30–08:31` xoá sạch 12 phút muộn). Tool cố ý không khai thác điều này — che khít theo số phút vi phạm thật, kết quả cuối để HRM chốt.
- **Lý do 20** *"OT hôm trước sau 21:00 (Cho phép đi muộn 30 phút)"* cũng không tốn phép và cho 5 lần/tuần, nhưng chưa được tận dụng. Người dùng vẫn tự tạo tay được.

## Files

| File | Vai trò |
|---|---|
| `shared/src/suggest.ts` | thuật toán đề xuất |
| `shared/src/suggest.test.ts` | test trên fixture thật |
| `frontend/hooks/use-auto-create-applications.ts` | gọi API tạo hàng loạt |
| `frontend/components/timesheet/AutoCreateApplicationsDialog.tsx` | preview, bỏ bớt đơn, tiến độ |
| `backend/src/scheduler/services/timesheet-scheduler.service.ts` | cron |
| `backend/src/automation/automation.service.ts` | `executeFormCreation` |
