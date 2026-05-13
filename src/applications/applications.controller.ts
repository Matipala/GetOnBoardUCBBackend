import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Req,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { Roles } from '../common/decorators/roles.decorator';

import * as requestWithUserInterface from '../common/interfaces/request-with-user.interface';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Roles('student')
  @Post()
  @UseInterceptors(FileInterceptor('cv'))
  async create(
    @Body() createApplicationDto: CreateApplicationDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5 MB
          new FileTypeValidator({ fileType: 'application/pdf' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Req() req: requestWithUserInterface.RequestWithUser,
  ) {
    const studentId = req.user.sub;
    return this.applicationsService.create(
      { ...createApplicationDto, studentId },
      file,
    );
  }

  @Roles('employer', 'coordinator', 'admin')
  @Get('offer/:offerId')
  findAllByOffer(@Param('offerId') offerId: string) {
    return this.applicationsService.findAllByOffer(+offerId);
  }

  @Roles('student')
  @Get('student/mine')
  findMyApplications(@Req() req: requestWithUserInterface.RequestWithUser) {
    return this.applicationsService.findAllByStudent(req.user.sub);
  }

  @Roles('coordinator', 'admin')
  @Get('student/:studentId')
  findAllByStudent(@Param('studentId') studentId: string) {
    return this.applicationsService.findAllByStudent(studentId);
  }

  @Roles('employer', 'admin')
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'PENDING' | 'IN_REVIEW' | 'ACCEPTED' | 'REJECTED',
  ) {
    return this.applicationsService.updateStatus(+id, status);
  }
}
