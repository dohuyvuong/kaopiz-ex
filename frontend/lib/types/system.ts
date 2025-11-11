/**
 * System type definitions
 */

export type SystemName = 'ksystem' | 'hrm';

export interface System {
  name: SystemName;
  displayName: string;
  description?: string;
}

export const SYSTEMS: Record<'KSYSTEM' | 'HRM', System> = {
  KSYSTEM: {
    name: 'ksystem',
    displayName: 'Ksystem',
    description: 'Ksystem (Microsoft SSO)',
  },
  HRM: {
    name: 'hrm',
    displayName: 'HRM',
    description: 'HRM (Ksystem OAuth)',
  },
} as const;
