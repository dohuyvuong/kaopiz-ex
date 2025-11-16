import { Injectable, Logger } from '@nestjs/common';
import { SystemName } from '../../common/types/system.types';
import { AuthProvider } from '../providers/auth-provider.interface';
import { MicrosoftSSOProvider } from '../providers/microsoft-sso.provider';
import { KsystemOAuthProvider } from '../providers/ksystem-oauth.provider';

/**
 * Service quản lý các authentication providers
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly providers: Map<string, AuthProvider> = new Map();

  constructor(
    private readonly microsoftSSOProvider: MicrosoftSSOProvider,
    private readonly ksystemOAuthProvider: KsystemOAuthProvider,
  ) {
    // Đăng ký các providers
    this.registerProvider(microsoftSSOProvider);
    this.registerProvider(ksystemOAuthProvider);
  }

  /**
   * Đăng ký một provider
   */
  private registerProvider(provider: AuthProvider): void {
    this.providers.set(provider.name, provider);
    this.logger.log(
      `Đã đăng ký provider: ${provider.name} cho hệ thống: ${provider.system}`,
    );
  }

  /**
   * Lấy provider theo tên
   */
  getProvider(name: string): AuthProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Lấy provider theo hệ thống
   */
  getProviderBySystem(system: SystemName): AuthProvider | undefined {
    for (const provider of this.providers.values()) {
      if (provider.system === system) {
        return provider;
      }
    }
    return undefined;
  }

  /**
   * Lấy danh sách tất cả providers
   */
  getAllProviders(): AuthProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Lấy danh sách providers theo hệ thống
   */
  getProvidersBySystem(system: SystemName): AuthProvider[] {
    return Array.from(this.providers.values()).filter(
      (p) => p.system === system,
    );
  }
}
