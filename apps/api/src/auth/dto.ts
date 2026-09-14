import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@email.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'uma-senha-longa', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Kaiki', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@email.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'uma-senha-longa' })
  @IsString()
  password!: string;
}

export class RefreshDto {
  @ApiProperty({ description: 'The refresh token returned by login or by a previous refresh.' })
  @IsString()
  refreshToken!: string;
}

export class TokensDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty({ description: 'Single use: refreshing rotates it and revokes this one.' })
  refreshToken!: string;

  @ApiProperty({ example: 900, description: 'Access token lifetime, in seconds.' })
  expiresIn!: number;
}
