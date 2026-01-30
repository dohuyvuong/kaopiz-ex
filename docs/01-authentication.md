# Authentication & Authorization

## Tổng quan

Hệ thống KaopizEX sử dụng multi-provider authentication để tích hợp với các hệ thống nội bộ (Ksystem và HRM). Mỗi hệ thống có thể yêu cầu token riêng, và người dùng có thể đăng nhập với nhiều hệ thống cùng lúc.

## Kiến trúc Authentication

### Providers

Hệ thống hỗ trợ 2 authentication providers:

1. **Microsoft SSO** (`microsoft-sso`)
   - System: `ksystem`
   - Flow: Microsoft SSO → Ksystem JWT Token
   - File: `backend/src/auth/providers/microsoft-sso.provider.ts`

2. **Ksystem OAuth** (`ksystem-oauth`)
   - System: `hrm`
   - Flow: Ksystem OAuth → HRM JWT Token
   - File: `backend/src/auth/providers/ksystem-oauth.provider.ts`

### Token Storage

**Frontend** (Zustand + localStorage):
- **Auth store**: `frontend/lib/stores/auth-store.ts`
- **localStorage**: Persist middleware với key `auth-storage`
- Lưu: `appToken`, `appRefreshToken`, `expiresIn`, `user`, `systems`

**Backend** (Database):
- System tokens (Ksystem, HRM) lưu trong bảng `SystemToken` (Prisma)
- App JWT do backend ký; refresh token lưu trong `AppRefreshToken`

Code reference: `frontend/lib/stores/auth-store.ts`

## Authentication Flow

### Tổng quan Flow

```
User → Login Page → Select Provider → Get Auth URL →
Open URL → Login → Copy Callback URL → Exchange Token →
Save to Zustand + localStorage → Redirect to Home
```

### Chi tiết từng bước

#### 1. User truy cập Login Page

**File**: `frontend/components/auth/LoginPageContent.tsx`

- Component load danh sách providers từ API
- Hiển thị dropdown để chọn provider
- Hiển thị trạng thái đăng nhập hiện tại (nếu có)

**Code reference**: `frontend/components/auth/LoginPageContent.tsx:51-65`

```typescript
useEffect(() => {
  const loadProviders = async () => {
    const providersList = await authApi.getProviders();
    setProviders(providersList);
    if (providersList.length > 0) {
      setSelectedProvider(providersList[0].name);
    }
  };
  loadProviders();
}, []);
```

#### 2. User chọn Provider và lấy Authorization URL

**API Endpoint**: `GET /auth/:provider/authorize`

**Backend**: `backend/src/auth/auth.controller.ts:51-105`

**Frontend**: `frontend/components/auth/LoginPageContent.tsx:80-103`

Khi user click "Lấy URL đăng nhập":

1. Gọi API `GET /auth/:provider/authorize`
2. Backend tạo authorization URL dựa trên provider:
   - **Microsoft SSO**: Tạo Azure AD authorization URL
   - **Ksystem OAuth**: Tạo Ksystem OAuth authorization URL (có thể nhận `redirectOAuth` parameter)
3. Frontend nhận `authUrl` và tự động mở trong tab mới

**Microsoft SSO Provider**:

```typescript
getAuthorizationUrl(): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: this.config.azureClientId,
    redirect_uri: this.config.azureRedirectUri,
    scope: this.config.azureScope,
    response_mode: 'fragment',
    prompt: 'select_account',
  });
  return `${this.config.azureAuthority}/oauth2/v2.0/authorize?${params.toString()}`;
}
```

Code reference: `backend/src/auth/providers/microsoft-sso.provider.ts:31-42`

**Ksystem OAuth Provider**:

```typescript
getAuthorizationUrl(redirectOAuth?: string): string {
  const params = new URLSearchParams({
    client_id: String(this.config.ksystemOAuthClientId),
    redirect_uri: this.config.ksystemOAuthRedirectUri || '',
    response_type: 'code',
    scope: '',
    state: this.generateState(),
  });
  if (redirectOAuth) {
    params.append('redirect_oauth', redirectOAuth);
  }
  return `${this.config.ksystemOAuthBaseUrl}/oauth/authorize?${params.toString()}`;
}
```

Code reference: `backend/src/auth/providers/ksystem-oauth.provider.ts:28-46`

#### 3. User đăng nhập và nhận Callback URL

- User đăng nhập trên trang authorization
- Sau khi đăng nhập thành công, browser redirect về `redirectUri` hoặc `redirectOAuth`
- URL callback chứa authorization code trong query string:
  - Microsoft SSO: `code` và `session_state` (có thể có)
  - Ksystem OAuth: `code` và `state`

#### 4. User paste Callback URL và Exchange Token

**API Endpoint**: `POST /auth/:provider/token`

**Backend**: `backend/src/auth/auth.controller.ts:111-165`

**Frontend**: `frontend/components/auth/LoginPageContent.tsx:105-144`

Khi user click "Xác nhận và lấy token":

1. Frontend gửi callback URL hoặc code trực tiếp đến backend
2. Backend extract code từ URL
3. Backend gọi provider's `exchangeCode()` để đổi code thành token:

**Microsoft SSO**:

```typescript
async exchangeCode(code: string, sessionState?: string | null): Promise<TokenResponse> {
  const payload: KsystemLoginPayload = {
    code: code,
  };
  if (sessionState) {
    payload.session_state = sessionState;
  }

  // Gọi Ksystem API để exchange code thành token
  const response = await firstValueFrom(
    this.httpService.post<KsystemLoginResponse>(
      ksystemLoginEndpoint,
      payload
    )
  );

  return {
    token: responseData.token,
    userInfo: responseData.user,
  };
}
```

Code reference: `backend/src/auth/providers/microsoft-sso.provider.ts:47-107`

**Ksystem OAuth**:

```typescript
async exchangeCode(code: string, state?: string): Promise<TokenResponse> {
  // Gọi HRM API callback endpoint
  const callbackUrl = `${hrmApiBaseUrl}/auth/callback?code=${encodeURIComponent(code)}`;
  if (state) {
    callbackUrl += `&state=${encodeURIComponent(state)}`;
  }

  const response = await firstValueFrom(
    this.httpService.get(callbackUrl)
  );

  return {
    token: responseData.token,
    userInfo: responseData.user,
    expiresAt: responseData.expires_in ? Date.now() + responseData.expires_in * 1000 : undefined,
  };
}
```

Code reference: `backend/src/auth/providers/ksystem-oauth.provider.ts:54-106`

#### 5. Lưu Token vào Redux và localStorage

**File**: `frontend/lib/stores/auth-store.ts`

**Action**: `setAuth`

```typescript
setAuth({
  appToken: response.appToken,
  appRefreshToken: response.appRefreshToken,
  expiresIn: response.expiresIn,
  user: response.user,
  systems: response.systems,
});
```

Code reference: `frontend/components/auth/LoginPageContent.tsx`

Zustand persist middleware tự động lưu vào localStorage với key `auth-storage`.

#### 6. Redirect về Dashboard

Sau khi lưu token thành công, redirect về `/dashboard`.

Code reference: `frontend/components/auth/LoginPageContent.tsx:137`

## Backend Auth Guard

Backend dùng **AppJwtAuthGuard** duy nhất để bảo vệ route: verify App JWT, lấy system token từ DB, gắn vào request.

**File**: `backend/src/auth/guards/app-jwt-auth.guard.ts`

**Decorator**: `@Auth('ksystem')` hoặc `@Auth('hrm')` — vừa set metadata vừa gắn guard.

**Request sau khi qua guard** (type `AuthenticatedRequest`):
- `request.user`: `{ id: number, email: string }` (từ JWT payload)
- `request.token`: system token (Ksystem hoặc HRM) lấy từ DB
- `request.system`: `'ksystem'` | `'hrm'`

**Type**: `backend/src/common/types/request.types.ts` — `AuthenticatedRequest` extends Express Request với `user`, `token`, `system`.

Controller dùng `@Token()` để lấy system token: `@Token() token: string`.

## Protected Routes

### SystemProtectedRoute Component

**File**: `frontend/components/auth/SystemProtectedRoute.tsx`

Component này bảo vệ routes bằng cách kiểm tra token cho system cụ thể.

**Logic**:

1. Xác định system requirement từ pathname hoặc prop
2. Kiểm tra token trong Zustand auth store
3. Nếu không có token, redirect về `/login` với error message
4. Nếu có token, render children

**Code reference**: `frontend/components/auth/SystemProtectedRoute.tsx:13-60`

```typescript
export function SystemProtectedRoute({
  children,
  system,
}: SystemProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const systems = useAuthStore((state) => state.systems);

  // Xác định system requirement
  const requiredSystem = useMemo(
    () => system || getSystemRequirementForPathname(pathname),
    [system, pathname],
  );

  // Kiểm tra đã đăng nhập system tương ứng chưa
  const hasToken = useMemo(() => {
    if (!requiredSystem) return true;
    return systems.includes(requiredSystem.name);
  }, [systems, requiredSystem]);

  useEffect(() => {
    if (!requiredSystem) return;
    if (!hasToken) {
      const errorMessage = `Vui lòng đăng nhập với ${requiredSystem.description || requiredSystem.displayName} để truy cập trang này`;
      router.push(`/login?error=${encodeURIComponent(errorMessage)}`);
    }
  }, [requiredSystem, hasToken, router]);

  if (!requiredSystem) {
    return <>{children}</>;
  }

  if (!hasToken) {
    return null; // Đã redirect
  }

  return <>{children}</>;
}
```

### Route Groups

Next.js App Router sử dụng route groups để phân chia routes theo system requirement:

- `(public)` - Routes công khai, không cần token
- `(ksystem)` - Routes yêu cầu Ksystem token
- `(hrm)` - Routes yêu cầu HRM token

**File structure**:

```
app/
├── (public)/
│   └── login/
├── (ksystem)/
│   └── checklist-review/
└── (hrm)/
    └── timesheet/
```

Mỗi route group có layout riêng sử dụng `SystemProtectedRoute`.

## Token Validation

### Backend Token Validation

Backend có thể validate token bằng cách gọi API của hệ thống tương ứng:

**Microsoft SSO Provider**:

```typescript
async validateToken(token: string): Promise<boolean> {
  const response = await firstValueFrom(
    this.httpService.get(
      `${this.config.ksystemApiBaseUrl}/info?with_project_role=true`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    ),
  );
  return !!response.data;
}
```

Code reference: `backend/src/auth/providers/microsoft-sso.provider.ts:112-133`

**Ksystem OAuth Provider**:

```typescript
async validateToken(token: string): Promise<boolean> {
  const response = await firstValueFrom(
    this.httpService.get(`${hrmApiBaseUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
  return !!response.data;
}
```

Code reference: `backend/src/auth/providers/ksystem-oauth.provider.ts:111-131`

### Frontend Token Usage

Khi gọi API, token được gửi trong header:

```typescript
headers: {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
}
```

Code reference: `frontend/lib/api/timesheet.ts:22-24`

## API Endpoints

### GET /auth/providers

Lấy danh sách các providers có sẵn.

**Response**:

```json
{
  "success": true,
  "message": "Danh sách providers",
  "data": [
    {
      "name": "microsoft-sso",
      "system": "ksystem"
    },
    {
      "name": "ksystem-oauth",
      "system": "hrm"
    }
  ]
}
```

Code reference: `backend/src/auth/auth.controller.ts:34-45`

### GET /auth/:provider/authorize

Lấy authorization URL cho provider cụ thể.

**Query Parameters** (cho Ksystem OAuth):
- `redirectOAuth` (optional): URL để redirect sau khi đăng nhập

**Response**:

```json
{
  "success": true,
  "message": "Vui lòng mở URL này trong trình duyệt...",
  "data": {
    "authUrl": "https://...",
    "redirectUri": "http://localhost:3000/auth/callback",
    "redirectOAuth": "http://localhost:3000/auth/callback",
    "provider": "microsoft-sso",
    "system": "ksystem",
    "instructions": [...]
  }
}
```

Code reference: `backend/src/auth/auth.controller.ts:51-105`

### POST /auth/:provider/token

Exchange authorization code thành token.

**Body**:

```json
{
  "url": "http://localhost:3000/auth/callback?code=...&session_state=..."
}
```

hoặc

```json
{
  "code": "...",
  "state": "...",
  "session_state": "..."
}
```

**Response**:

```json
{
  "success": true,
  "message": "Đã lấy token thành công cho ksystem",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "system": "ksystem",
    "provider": "microsoft-sso",
    "userInfo": {...},
    "expiresAt": 1234567890000,
    "note": "Lưu token này và gửi kèm trong header Authorization: Bearer <token>..."
  }
}
```

Code reference: `backend/src/auth/auth.controller.ts:111-165`

## Error Handling

### Frontend

- Hiển thị error message trong UI khi có lỗi
- Lưu error vào state và hiển thị trong Card component
- Error từ URL query params được decode và hiển thị

Code reference: `frontend/components/auth/LoginPageContent.tsx:39-48, 158-162`

### Backend

- Sử dụng NestJS exception filters để xử lý lỗi
- Trả về error response với status code phù hợp
- Log lỗi để debug

Code reference: `backend/src/auth/providers/microsoft-sso.provider.ts:97-106`

## State Management

### Redux Store

**Slice**: `frontend/lib/features/auth/authSlice.ts`

**State Structure**:

```typescript
interface AuthState {
  tokens: {
    ksystem?: TokenInfo;
    hrm?: TokenInfo;
  };
  isLoading: boolean;
}
```

**Actions**:

- `setToken`: Lưu token cho system cụ thể
- `clearToken`: Xóa token (có thể xóa một system hoặc tất cả)
- `setLoading`: Set loading state

**Redux Persist**:

Token được persist vào localStorage với key `auth`:

```typescript
auth: persistReducer(
  {
    key: 'auth',
    storage: localStorage,
  },
  authReducer,
)
```

Code reference: `frontend/lib/store.ts:9-15`

## Security Considerations

1. **Token Storage**: Tokens được lưu trong localStorage (có thể bị XSS attack). Cân nhắc sử dụng httpOnly cookies cho production.

2. **State Parameter**: Ksystem OAuth sử dụng state parameter cho CSRF protection, nhưng chưa implement validation.

3. **Token Expiration**: Tokens có thể có `expiresAt`, nhưng frontend chưa tự động refresh hoặc clear expired tokens.

4. **HTTPS**: Nên sử dụng HTTPS trong production để bảo vệ tokens khi truyền qua network.
