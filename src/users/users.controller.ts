import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

import * as requestWithUserInterface from '../common/interfaces/request-with-user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Roles('admin')
  @Get('stats')
  getStats() {
    return this.usersService.getStats();
  }

  @Roles('coordinator')
  @Get('coordinator/stats')
  async getCoordinatorStats(
    @Req() req: requestWithUserInterface.RequestWithUser,
  ) {
    let career = req.user.career;

    if (!career) {
      const user = await this.usersService.findOne(req.user.sub);
      career = user.career;
    }

    return this.usersService.getCoordinatorStats(career);
  }

  @Roles('admin', 'coordinator')
  @Get()
  findAll(@Query('career') career?: string) {
    return this.usersService.findAll(career);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() req: requestWithUserInterface.RequestWithUser,
  ) {
    const requesterId = req.user.sub;
    const requesterRole = req.user.role;
    if (
      requesterRole !== 'admin' &&
      requesterRole !== 'coordinator' &&
      requesterId !== id
    ) {
      return { message: 'No autorizado' };
    }
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: requestWithUserInterface.RequestWithUser,
  ) {
    const requesterId = req.user.sub;
    const requesterRole = req.user.role;
    if (
      requesterRole !== 'admin' &&
      requesterRole !== 'coordinator' &&
      requesterId !== id
    ) {
      return { message: 'No autorizado' };
    }
    return this.usersService.update(id, dto);
  }

  @Roles('admin')
  @Patch(':id/role')
  assignRole(@Param('id') id: string, @Body('role') role: string) {
    return this.usersService.assignRole(id, role as UserRole);
  }

  @Roles('admin')
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  @Roles('admin')
  @Patch(':id/reactivate')
  reactivate(@Param('id') id: string) {
    return this.usersService.reactivate(id);
  }
}
