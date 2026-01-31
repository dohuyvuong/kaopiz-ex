/**
 * User info structure from Ksystem
 */
export interface KsystemUserInfo {
  email: string;
  name?: string;
  [key: string]: unknown;
}

/**
 * User info structure from HRM
 */
export interface HrmUserInfo {
  info: {
    email: string;
    name?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Union type for system user info
 */
export type SystemUserInfo = KsystemUserInfo | HrmUserInfo;

/**
 * Type guard to check if userInfo is from Ksystem
 */
export function isKsystemUserInfo(
  userInfo: unknown,
): userInfo is KsystemUserInfo {
  return (
    typeof userInfo === 'object' &&
    userInfo !== null &&
    'email' in userInfo &&
    typeof (userInfo as KsystemUserInfo).email === 'string'
  );
}

/**
 * Type guard to check if userInfo is from HRM
 */
export function isHrmUserInfo(userInfo: unknown): userInfo is HrmUserInfo {
  return (
    typeof userInfo === 'object' &&
    userInfo !== null &&
    'info' in userInfo &&
    typeof (userInfo as HrmUserInfo).info === 'object' &&
    (userInfo as HrmUserInfo).info !== null &&
    'email' in (userInfo as HrmUserInfo).info
  );
}
