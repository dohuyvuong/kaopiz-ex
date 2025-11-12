/**
 * Common user info type - chuẩn hóa thông tin người dùng từ các hệ thống
 */

export interface UserProfile {
  id: number;
  user_id: number;
  code: string;
  phone?: string | null;
  avatar?: string | null;
  birthday?: string | null;
  gender?: number | null;
  major?: string | null;
  rank_id?: number | null;
  job_grade_id?: number | null;
  working_start_date?: string | null;
  official_start_date?: string | null;
}

export interface CommonUserInfo {
  id: number;
  name: string;
  email: string;
  timesheet_code?: number | null;
  jira_user_key?: string | null;
  jira_name?: string | null;
  status: number;
  department_names?: string[];
  department_codes?: string[];
  department_short_name?: string | null;
  user_profile?: UserProfile | null;
}

/**
 * Type cho userInfo từ Ksystem (trả về trực tiếp CommonUserInfo)
 */
export type KsystemUserInfo = CommonUserInfo;

/**
 * Type cho userInfo từ HRM (wrap trong object có key "info")
 */
export interface HrmUserInfoResponse {
  info: CommonUserInfo & {
    s_point?: number;
    role_names?: string[] | null;
    all_permissions_name?: Array<{
      name: string;
      scope: string;
    }>;
    department_ids_can_execute?: number[];
    is_bod?: boolean;
    roles?: unknown[];
    departments_director?: unknown[];
    departments_vice_director?: unknown[];
    user_group_permissions?: unknown[];
    user_permissions?: unknown[];
  };
}
