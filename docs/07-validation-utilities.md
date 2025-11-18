# Validation Utilities

## Tổng quan

File `frontend/lib/utils/application-form.ts` chứa các utility functions để validation và tính toán liên quan đến application forms.

## Functions

### isTimeOverlapping

**Purpose**: Kiểm tra hai khoảng thời gian có overlap không

**Code reference**: `frontend/lib/utils/application-form.ts:8-26`

**Logic**:
- Nếu đơn cũ không có thời gian cụ thể (cả ngày) → overlap với mọi thời gian
- Overlap: `newStart < existingEnd && newEnd > existingStart`

### getAllFormsInDay

**Purpose**: Lấy tất cả đơn trong ngày (bao gồm cả chưa approve)

**Code reference**: `frontend/lib/utils/application-form.ts:31-69`

**Logic**:
- Lấy đơn đã approve từ `calendarDay`
- Lấy đơn từ `dayDetail` (loại bỏ duplicate bằng id)

### checkOverlappingForms

**Purpose**: Kiểm tra đơn có overlap với các đơn đã có trong ngày không

**Code reference**: `frontend/lib/utils/application-form.ts:74-99`

**Logic**:
- Lấy tất cả đơn trong ngày
- Kiểm tra overlap với từng trackingTime trong mỗi đơn

### checkAbsenceFormInWeek

**Purpose**: Kiểm tra đã có đơn vắng mặt (typeId 2) trong tuần chưa

**Code reference**: `frontend/lib/utils/application-form.ts:105-169`

**Logic**:
1. Tính weekStart và weekEnd từ date
2. Lặp qua calendarDays trong tuần
3. Kiểm tra approved forms từ timesheet
4. Kiểm tra pending forms từ mergedDays (ưu tiên)
5. Kiểm tra pending forms từ dayDetailMap (fallback)

**Return**: `true` nếu đã có đơn vắng mặt trong tuần

### getMissingTimeRanges

**Purpose**: Xác định khoảng thời gian thiếu chấm công

**Code reference**: `frontend/lib/utils/application-form.ts:174-218`

**Logic**:
- Không có timeIn và timeOut → thiếu cả ngày
- Có timeIn nhưng không có timeOut → thiếu từ timeIn đến workEnd
- Có timeOut nhưng không có timeIn → thiếu từ workStart đến timeOut
- Có cả timeIn và timeOut → kiểm tra khoảng trống

**Return**: Array of `{ start: string, end: string }`

### calculateMinutes

**Purpose**: Tính số phút giữa hai thời gian

**Code reference**: `frontend/lib/utils/application-form.ts:223-229`

**Logic**:
- Parse timeStart và timeEnd với dayjs
- Tính diff bằng phút

**Return**: `number | null`
