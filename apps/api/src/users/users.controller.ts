import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('/users')
export class UsersController {
  constructor(private service: UsersService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.service.create(dto);
  }
}
