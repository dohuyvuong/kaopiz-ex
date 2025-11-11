import { IsOptional, IsString } from 'class-validator';

export class ProviderAuthorizeQueryDto {
  @IsOptional()
  @IsString()
  redirectOAuth?: string;
}
