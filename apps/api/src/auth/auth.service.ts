import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, Role, User } from '@prisma/client';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto, TokensDto } from './dto';

/** Shape the API is allowed to return: everything on User except the hash. */
export const userPublicSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{ select: typeof userPublicSelect }>;

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: Role;
}

const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<TokensDto> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('E-mail already registered');

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: await argon2.hash(dto.password),
      },
    });

    return this.issueTokens(user);
  }

  async login(dto: LoginDto): Promise<TokensDto> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    // Verify against a decoy hash when the e-mail does not exist, so that a
    // missing user and a wrong password take the same time to answer and the
    // response cannot be used to enumerate accounts.
    const hash = user?.password ?? (await decoyHash());
    const ok = await argon2.verify(hash, dto.password).catch(() => false);
    if (!user || !ok) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens(user);
  }

  /**
   * Rotates the refresh token: the presented one is revoked and a new pair is
   * issued. Presenting a token that was already used (or revoked) revokes the
   * user's whole family of tokens — that is the signature of a stolen token
   * being replayed, and it logs the real user out of every session.
   */
  async refresh(presented: string): Promise<TokensDto> {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(presented) },
      include: { user: true },
    });

    if (!stored) throw new UnauthorizedException('Invalid refresh token');

    if (stored.revokedAt || stored.expiresAt < new Date()) {
      if (stored.revokedAt) await this.revokeAllForUser(stored.userId);
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(stored.user);
  }

  async logout(presented: string): Promise<void> {
    // Revoking an unknown or already revoked token is not an error: logging out
    // twice, or with a stale token, should still leave the caller logged out.
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: hashToken(presented), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: userPublicSelect,
    });
    if (!user) throw new UnauthorizedException();
    return user;
  }

  private async issueTokens(user: User): Promise<TokensDto> {
    const payload: AccessTokenPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwt.signAsync(payload, { expiresIn: ACCESS_TTL_SECONDS });

    const refreshToken = randomBytes(32).toString('hex');
    await this.prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(refreshToken),
        userId: user.id,
        expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      },
    });

    return { accessToken, refreshToken, expiresIn: ACCESS_TTL_SECONDS };
  }

  private async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}

/**
 * Refresh tokens are random, not derived from user data, so a fast hash is the
 * right tool here — it only has to make a leaked database row useless. Password
 * hashing is a different problem and uses argon2 above.
 */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * A real argon2 hash of a random value nobody can present, for the timing path
 * in login(). It has to be computed rather than hardcoded: verifying against a
 * malformed hash throws immediately, which would leak the very timing
 * difference this is here to remove. Computed once, on first use.
 */
let decoy: Promise<string> | null = null;
function decoyHash(): Promise<string> {
  decoy ??= argon2.hash(randomBytes(32).toString('hex'));
  return decoy;
}
