import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  }

  create(dto: CreateUserDto) {
    return this.prisma.user.create({ data: dto });
  }
}
