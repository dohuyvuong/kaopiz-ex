# UI Components

## Tổng quan

Hệ thống sử dụng Shadcn UI (Radix UI + Tailwind CSS) cho các UI components.

## Component Library

### Shadcn UI Components

Các components được cài đặt từ shadcn/ui:
- Dialog, Sheet, Accordion
- Button, Input, Label, Select, Combobox
- Card, Badge, Alert, Progress
- Tabs, Tooltip, Popover
- Sidebar, Avatar, Separator
- Skeleton, Pagination

**Location**: `frontend/components/ui/`

## Toast Notifications

### Sonner

**Library**: Sonner

**Component**: `frontend/components/ui/sonner.tsx`

**Usage**:

```typescript
import { toast } from 'sonner';

toast.success('Tạo đơn từ thành công');
```

**Code reference**: `frontend/components/timesheet/CreateApplicationFormDialog.tsx:90`

**Setup**: Toaster được thêm vào root layout.

**Code reference**: `frontend/app/layout.tsx:33`

## Loading States

### Patterns

1. **Button Loading**: Disable button và hiển thị spinner
2. **Page Loading**: Hiển thị loading indicator ở giữa màn hình
3. **Skeleton Loading**: Hiển thị skeleton placeholders

### Examples

**Button Loading**:

```typescript
<Button disabled={loading}>
  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  Submit
</Button>
```

**Page Loading**:

```typescript
{isLoading && (
  <div className="flex items-center justify-center h-64">
    <div className="text-muted-foreground">Đang tải...</div>
  </div>
)}
```

**Code reference**: `frontend/components/timesheet/TimesheetDayDetail.tsx:81-85`

## Error Display

### Patterns

1. **Alert Component**: Hiển thị error message với AlertCircle icon
2. **Inline Error**: Hiển thị error dưới input field
3. **Toast Error**: Hiển thị error qua toast notification

### Examples

**Alert Error**:

```typescript
{error && (
  <div className="flex items-center gap-2 text-destructive">
    <AlertCircle className="h-5 w-5" />
    {error}
  </div>
)}
```

**Code reference**: `frontend/components/timesheet/TimesheetDayDetail.tsx:87-92`

## Form Components

### CreateApplicationFormDialog

**File**: `frontend/components/timesheet/CreateApplicationFormDialog.tsx`

Sử dụng Dialog component với form fields:
- Select (type, reason)
- Combobox (approvers)
- Input (timeStart, timeEnd)
- Alert (warnings, errors)

### AutoCreateApplicationsDialog

**File**: `frontend/components/timesheet/AutoCreateApplicationsDialog.tsx`

Sử dụng Dialog component với:
- Preview section
- Application list với edit/remove
- Progress bar
- Missing approvers warning

## Layout Components

### DashboardLayout

**File**: `frontend/components/layout/DashboardLayout.tsx`

Layout chính với sidebar và breadcrumb.

### Breadcrumb

**File**: `frontend/components/layout/Breadcrumb.tsx`

Hiển thị breadcrumb navigation.

## Component Hierarchy

```
DashboardLayout
├── Sidebar
│   ├── NavMain
│   └── NavUser
├── Breadcrumb
└── Page Content
    ├── TimesheetCalendar
    │   └── TimesheetDayCell (multiple)
    ├── TimesheetDayDetail (Sheet)
    │   └── CreateApplicationFormDialog
    └── AutoCreateApplicationsDialog
```
