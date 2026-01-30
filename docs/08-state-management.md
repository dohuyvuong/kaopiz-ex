# State Management

## Tổng quan

Hệ thống sử dụng **Zustand** với persist middleware để quản lý state. State được persist vào localStorage.

> **Migration Note**: Đã migrate từ Redux Toolkit sang Zustand (Jan 2026) để đơn giản hóa codebase. Chi tiết xem `MIGRATION_REDUX_TO_ZUSTAND.md`.

## Zustand Stores

### 1. Auth Store

**File**: `frontend/lib/stores/auth-store.ts`

#### State Structure

```typescript
interface AuthState {
  // State
  appToken: string | null;
  appRefreshToken: string | null;
  expiresIn: number | null;
  user: AppUser | null;
  systems: SystemName[];
  isLoading: boolean;

  // Actions
  setAuth: (auth: {...}) => void;
  updateAppToken: (update: {...}) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
}
```

#### Usage

```typescript
// Select state
const user = useAuthStore((state) => state.user);
const appToken = useAuthStore((state) => state.appToken);

// Call actions
const setAuth = useAuthStore((state) => state.setAuth);
const clearAuth = useAuthStore((state) => state.clearAuth);

setAuth({ appToken, user, systems });
clearAuth();
```

#### Direct Access (Outside React)

```typescript
// Get state
const token = useAuthStore.getState().appToken;

// Call actions
useAuthStore.getState().setAuth({...});
useAuthStore.getState().clearAuth();
```

#### Persistence

- **localStorage key**: `'auth-storage'`
- **Auto-persisted**: Changes automatically saved to localStorage
- **Auto-hydrated**: State restored on app load

### 2. Application Form Store

**File**: `frontend/lib/stores/application-form-store.ts`

#### State Structure

```typescript
interface ApplicationFormState {
  // State
  approvers: Record<number, Record<number, number | null>>;

  // Actions
  setApprover: (typeId: number, order: number, userId: number | null) => void;
  setApprovers: (typeId: number, approvers: Record<number, number | null>) => void;
  clearApprovers: (typeId?: number) => void;
}
```

#### Structure Example

```typescript
{
  approvers: {
    1: { 1: 123, 2: 456 },  // Type 1: Order 1 = User 123, Order 2 = User 456
    2: { 1: 789 }           // Type 2: Order 1 = User 789
  }
}
```

#### Usage

```typescript
// Select state
const approvers = useApplicationFormStore((state) => state.approvers);

// Call actions
const setApprover = useApplicationFormStore((state) => state.setApprover);
const clearApprovers = useApplicationFormStore((state) => state.clearApprovers);

setApprover(1, 1, 123); // Type 1, Order 1, User 123
clearApprovers(1); // Clear approvers for Type 1
```

#### Persistence

- **localStorage key**: `'application-form-storage'`
- **Auto-persisted**: Changes automatically saved to localStorage

### 3. Sidebar Store

**File**: `frontend/lib/stores/sidebar-store.ts`

#### State Structure

```typescript
interface SidebarState {
  // State
  isOpen: boolean;

  // Actions
  setOpen: (isOpen: boolean) => void;
  toggle: () => void;
}
```

#### Usage

```typescript
// Select state
const isOpen = useSidebarStore((state) => state.isOpen);

// Call actions
const toggle = useSidebarStore((state) => state.toggle);
toggle();
```

#### Persistence

- **localStorage key**: `'sidebar-storage'`

## Best Practices

### ✅ DO: Separate Selectors

```typescript
// ✅ Good: Selective subscription
const user = useAuthStore((state) => state.user);
const systems = useAuthStore((state) => state.systems);
// Component only re-renders when user or systems change
```

### ❌ DON'T: Object Selectors

```typescript
// ❌ Bad: Creates new object every render → infinite loop
const { user, systems } = useAuthStore((state) => ({
  user: state.user,
  systems: state.systems,
}));
```

**Why?** Zustand compares by reference (`===`). New object → infinite re-renders.

**Fix?** If you must return an object, use `shallow` compare:

```typescript
import { shallow } from 'zustand/shallow';

const { user, systems } = useAuthStore(
  (state) => ({ user: state.user, systems: state.systems }),
  shallow, // ✅ Compare by value
);
```

### Accessing Store Outside React

```typescript
// ✅ Good: Direct access (e.g., in API client)
function getAppToken(): string | null {
  return useAuthStore.getState().appToken;
}

function updateToken(newToken: string) {
  useAuthStore.getState().updateAppToken({ appToken: newToken });
}
```

## State Flow Examples

### Example 1: Login Flow

```
User logs in →
authApi.exchangeToken() →
useAuthStore.getState().setAuth({...}) →
Store updates →
Persist to localStorage →
Token available everywhere
```

### Example 2: Save Approver

```
User selects approver →
handleApproverChange() →
setApprover(typeId, order, userId) →
Store updates →
Persist to localStorage →
State available on next form creation
```

### Example 3: Token Refresh

```
API call returns 401 →
Axios interceptor detects →
useAuthStore.getState().getAppRefreshToken() →
Call authApi.refreshToken() →
useAuthStore.getState().updateAppToken(newToken) →
Retry original request →
Success
```

## Migration from Redux

**Before (Redux Toolkit)**:
- 9 files (slices, store, hooks, provider)
- ~400 lines of code
- ~12KB bundle size
- Need Provider wrapper
- Complex patterns (actions, reducers, dispatch)

**After (Zustand)**:
- 3 files (stores)
- ~188 lines of code
- ~1KB bundle size
- No Provider needed
- Simple patterns (direct state + actions)

**Reduction**: -53% code, -92% bundle size 🎉

## API Integration

Zustand store được sử dụng trong API client để token refresh:

**File**: `frontend/lib/api/client.ts`

```typescript
import { useAuthStore } from '@/lib/stores/auth-store';

// Get token for requests
function getAppToken(): string | null {
  return useAuthStore.getState().appToken;
}

// Update token after refresh
function updateAppToken(newToken: string) {
  useAuthStore.getState().updateAppToken({
    appToken: newToken,
    expiresIn: 3600,
  });
}

// Clear auth on failure
function clearAuthAndRedirect() {
  useAuthStore.getState().clearAuth();
  window.location.href = '/login';
}
```

**Benefits**:
- ✅ No store injection needed
- ✅ Direct access outside React
- ✅ Simpler, cleaner code

## DevTools

Zustand có DevTools support:

```typescript
import { devtools } from 'zustand/middleware';

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({ /* ... */ }),
      { name: 'auth-storage' }
    ),
    { name: 'AuthStore' } // ✅ Shows in Redux DevTools
  )
);
```

## Resources

- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [Zustand vs Redux](https://docs.pmnd.rs/zustand/getting-started/comparison)
- [Zustand Persist](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)
- [Migration Guide](../MIGRATION_REDUX_TO_ZUSTAND.md)
