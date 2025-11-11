import { IsOptional, IsString } from 'class-validator';

export class ProviderExchangeTokenDto {
  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  session_state?: string;
}
