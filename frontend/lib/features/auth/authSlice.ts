import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SystemName } from '@/lib/types/system';
import { CommonUserInfo, HrmUserInfoResponse } from '@/lib/types/userInfo';

export interface TokenInfo {
  token: string;
  system: SystemName;
  provider: string;
  userInfo?: CommonUserInfo | HrmUserInfoResponse;
  expiresAt?: number;
}

interface AuthState {
  tokens: {
    ksystem?: TokenInfo;
    hrm?: TokenInfo;
  };
  isLoading: boolean;
}

const initialState: AuthState = {
  tokens: {},
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (
      state,
      action: PayloadAction<{
        token: string;
        system: SystemName;
        provider: string;
        userInfo?: CommonUserInfo | HrmUserInfoResponse;
        expiresAt?: number;
      }>,
    ) => {
      const { token, system, provider, userInfo, expiresAt } = action.payload;
      state.tokens[system as keyof typeof state.tokens] = {
        token,
        system,
        provider,
        userInfo,
        expiresAt,
      };
    },
    clearToken: (state, action: PayloadAction<SystemName | undefined>) => {
      if (action.payload) {
        // Xóa token của system cụ thể
        delete state.tokens[action.payload as keyof typeof state.tokens];
      } else {
        // Xóa tất cả tokens
        state.tokens = {};
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setToken, clearToken, setLoading } = authSlice.actions;
export default authSlice.reducer;
