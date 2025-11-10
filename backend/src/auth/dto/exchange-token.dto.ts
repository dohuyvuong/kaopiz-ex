import { IsOptional, IsString } from 'class-validator';

export class ExchangeTokenDto {
  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  session_state?: string;
}
