import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateLeadDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  company?: string;

  // ✅ NEW (Phase-2)
  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  region?: string;
}
