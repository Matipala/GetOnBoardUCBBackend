import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('cv'))
  async create(
    @Body() createApplicationDto: CreateApplicationDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.applicationsService.create(createApplicationDto, file);
  }

  @Get('offer/:offerId')
  findAllByOffer(@Param('offerId') offerId: string) {
    return this.applicationsService.findAllByOffer(+offerId);
  }

  @Get('student/:studentId')
  findAllByStudent(@Param('studentId') studentId: string) {
    return this.applicationsService.findAllByStudent(studentId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'PENDING' | 'IN_REVIEW' | 'ACCEPTED' | 'REJECTED',
  ) {
    return this.applicationsService.updateStatus(+id, status);
  }
}
