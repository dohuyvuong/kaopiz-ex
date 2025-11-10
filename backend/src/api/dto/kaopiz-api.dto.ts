export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface AutoFlowData {
  checklistId: string;
  action: string;
  data?: Record<string, unknown>;
}

export interface AutoFlowResponse {
  success?: boolean;
  [key: string]: unknown;
}
