export interface KaopizLoginPayload {
  code: string;
  session_state?: string;
}

export interface KaopizLoginResponse {
  user: {
    id: number;
    name: string;
    email: string;
    timesheet_code: number;
    jira_user_key: string;
    jira_name: string;
    status: number;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    department_names: string[] | null;
    department_codes: string[] | null;
    role_names: string[] | null;
    job_title_names: string[] | null;
    job_title_codes: string[] | null;
    department_short_name: string;
    level_names: string[] | null;
    user_profile?: {
      id: number;
      user_id: number;
      code: string;
      katakana_name: string | null;
      phone: string;
      birthday: string;
      gender: number;
      major: string;
      graduation_date: string | null;
      description: string | null;
      avatar: string | null;
      rank_id: number;
      job_grade_id: number;
      job_grade_exception: number;
      contract_department_id: number;
      working_start_date: string;
      official_start_date: string;
      deactived_date: string | null;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
      introduce: string | null;
      university: number;
      working_end_date: string | null;
      contract_department?: {
        id: number;
        department_id: number;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
        department?: {
          id: number;
          name: string;
          name_vi: string;
          name_jp: string;
          description: string | null;
          parent_department: number;
          is_sbu_level: number;
          code: string;
          is_production_department: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
      };
    };
    department_job_titles?: Array<{
      id: number;
      name: string;
      name_vi: string;
      name_jp: string;
      description: string;
      parent_department: number;
      is_sbu_level: number;
      code: string;
      is_production_department: number;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
      pivot: {
        user_id: number;
        department_id: number;
        division_department_id: number | null;
        job_title_id: number;
      };
    }>;
    departments?: Array<{
      id: number;
      name: string;
      name_vi: string;
      name_jp: string;
      description: string;
      parent_department: number;
      is_sbu_level: number;
      code: string;
      is_production_department: number;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
      pivot: {
        user_id: number;
        department_id: number;
        role_id: number;
      };
    }>;
  };
  token: string;
}
