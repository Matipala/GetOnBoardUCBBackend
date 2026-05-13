import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';

import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Public()
  @Get()
  findAll() {
    return this.offersService.findAll();
  }

  @Roles('employer', 'admin')
  @Get('employer/mine')
  findMine(@Req() req: RequestWithUser) {
    return this.offersService.findByEmployer(req.user.sub);
  }

  @Roles('coordinator', 'admin', 'student')
  @Get('career/:career')
  findByCareer(@Param('career') career: string) {
    return this.offersService.findByCareer(career);
  }

  @Roles('admin')
  @Get('stats')
  getStats() {
    return this.offersService.getStats();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.offersService.findOne(id);
  }

  @Roles('employer', 'admin')
  @Post()
  create(@Body() createOfferDto: CreateOfferDto, @Req() req: RequestWithUser) {
    return this.offersService.create(createOfferDto, req.user.sub);
  }

  @Roles('employer', 'admin')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOfferDto: UpdateOfferDto,
    @Req() req: RequestWithUser,
  ) {
    return this.offersService.update(
      id,
      updateOfferDto,
      req.user.sub,
      req.user.role,
    );
  }

  @Roles('employer', 'admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.offersService.remove(id, req.user.sub, req.user.role);
  }
}
