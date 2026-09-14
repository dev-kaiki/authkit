import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { LoginDto, RefreshDto, RegisterDto, TokensDto } from './dto';
import type { RequestUser } from './jwt-auth.guard';
import { Public } from './public.decorator';

@ApiTags('auth')
@Controller('/auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Create an account and sign in' })
  @ApiResponse({ status: 201, type: TokensDto })
  @ApiResponse({ status: 409, description: 'E-mail already registered' })
  register(@Body() dto: RegisterDto): Promise<TokensDto> {
    return this.auth.register(dto);
  }

  // Five attempts a minute: enough for someone fat-fingering a password,
  // useless for walking a password list.
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Exchange e-mail and password for a token pair' })
  @ApiResponse({ status: 200, type: TokensDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() dto: LoginDto): Promise<TokensDto> {
    return this.auth.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Rotate a refresh token for a fresh pair' })
  @ApiResponse({ status: 200, type: TokensDto })
  @ApiResponse({ status: 401, description: 'Invalid, expired or already used token' })
  refresh(@Body() dto: RefreshDto): Promise<TokensDto> {
    return this.auth.refresh(dto.refreshToken);
  }

  @Public()
  @Post('logout')
  @HttpCode(204)
  @ApiOperation({ summary: 'Revoke a refresh token' })
  @ApiResponse({ status: 204, description: 'Revoked, or already was' })
  logout(@Body() dto: RefreshDto): Promise<void> {
    return this.auth.logout(dto.refreshToken);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'The account behind the access token' })
  @ApiResponse({ status: 401, description: 'Missing, invalid or expired token' })
  me(@CurrentUser() user: RequestUser) {
    return this.auth.me(user.id);
  }
}
