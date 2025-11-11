import { SetMetadata } from '@nestjs/common';
import { SystemName } from '../../common/types/system.types';

export const SYSTEM_KEY = 'system';

/**
 * Decorator để chỉ định hệ thống cho guard
 * @param system - Tên hệ thống ('ksystem' | 'hrm')
 */
export const System = (system: SystemName) => SetMetadata(SYSTEM_KEY, system);
