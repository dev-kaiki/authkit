import { ConflictException, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PublicUser, userPublicSelect } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  list(): Promise<PublicUser[]> {
    return this.prisma.user.findMany({
      select: userPublicSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateUserDto): Promise<PublicUser> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('E-mail already registered');

    return this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        role: dto.role,
        password: await argon2.hash(dto.password),
      },
      // Selecting explicitly, rather than deleting the field afterwards: the
      // hash never leaves the database, so it cannot be leaked by forgetting a
      // step later.
      select: userPublicSelect,
    });
  }
}
