import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'user@email.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Kaiki', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;
}
