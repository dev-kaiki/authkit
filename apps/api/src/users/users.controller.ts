import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { CreateUserDto } from './dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('/users')
export class UsersController {
  constructor(private service: UsersService) {}

  // Administration of other people's accounts: ADMIN only, applied at the class
  // above so a route added here cannot forget it. Self-service sign-up is
  // /auth/register, which is public.
  @Get()
  @ApiOperation({ summary: 'List every account' })
  @ApiResponse({ status: 403, description: 'Caller is not an ADMIN' })
  list() {
    return this.service.list();
  }

  @Post()
  @ApiOperation({ summary: 'Create an account, optionally as ADMIN' })
  @ApiResponse({ status: 403, description: 'Caller is not an ADMIN' })
  @ApiResponse({ status: 409, description: 'E-mail already registered' })
  create(@Body() dto: CreateUserDto) {
    return this.service.create(dto);
  }
}
