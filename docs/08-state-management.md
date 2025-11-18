# State Management

## Tổng quan

Hệ thống sử dụng Redux Toolkit với Redux Persist để quản lý state. State được persist vào localStorage.

## Redux Store Structure

### Store Configuration

**File**: `frontend/lib/store.ts`

**Code reference**: `frontend/lib/store.ts:1-46`

### Reducers

```typescript
{
  auth: AuthState,
  sidebar: SidebarState,
  applicationForm: ApplicationFormState
}
```

## Auth Slice

### State Structure

**File**: `frontend/lib/features/auth/authSlice.ts`

```typescript
interface AuthState {
  tokens: {
    ksystem?: TokenInfo;
    hrm?: TokenInfo;
  };
  isLoading: boolean;
}
```

**Code reference**: `frontend/lib/features/auth/authSlice.ts:13-19`

### Actions

- `setToken`: Lưu token cho system cụ thể
- `clearToken`: Xóa token (có thể xóa một system hoặc tất cả)
- `setLoading`: Set loading state

**Code reference**: `frontend/lib/features/auth/authSlice.ts:30-61`

### Persistence

Persist vào localStorage với key `auth`.

**Code reference**: `frontend/lib/store.ts:9-15`

## Application Form Slice

### State Structure

**File**: `frontend/lib/features/application-form/applicationFormSlice.ts`

```typescript
interface ApplicationFormApproversState {
  approvers: Record<number, Record<number, number | null>>;
}
```

**Code reference**: `frontend/lib/features/application-form/applicationFormSlice.ts:5-7`

### Structure Example

```typescript
{
  approvers: {
    1: { 1: 123, 2: 456 },  // Type 1: Order 1 = User 123, Order 2 = User 456
    2: { 1: 789 }           // Type 2: Order 1 = User 789
  }
}
```

### Actions

- `setApprover`: Lưu approver cho typeId và order
- `setApprovers`: Lưu tất cả approvers cho một typeId
- `clearApprovers`: Xóa approvers

**Code reference**: `frontend/lib/features/application-form/applicationFormSlice.ts:17-58`

### Persistence

Persist vào localStorage với key `applicationForm`.

**Code reference**: `frontend/lib/store.ts:23-29`

## Redux Persist Configuration

### Storage

Sử dụng custom localStorage implementation.

**File**: `frontend/lib/storage.ts`

### Persist Config

```typescript
persistReducer(
  {
    key: 'auth',
    storage: localStorage,
  },
  authReducer,
)
```

**Code reference**: `frontend/lib/store.ts:9-15`

## Hooks

### useAppSelector

Custom hook để select state từ Redux store.

**File**: `frontend/lib/hooks.ts`

### useAppDispatch

Custom hook để dispatch actions.

**File**: `frontend/lib/hooks.ts`

## State Flow

### Example: Save Approver

```
User selects approver →
handleApproverChange →
dispatch(setApprover) →
Redux store update →
Redux Persist save to localStorage →
State available on next page load
```

### Example: Load Token

```
User logs in →
dispatch(setToken) →
Redux store update →
Redux Persist save to localStorage →
Token available on page reload
```
