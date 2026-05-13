import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CompaniesService } from './companies.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('employer')
  @Get('me')
  findMyCompany(@Request() req: RequestWithUser) {
    return this.companiesService.findMyCompany(req.user.sub);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('employer')
  @Patch('me')
  updateMyCompany(
    @Request() req: RequestWithUser,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    return this.companiesService.updateMyCompany(
      req.user.sub,
      updateCompanyDto,
    );
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('employer')
  @Post('me/logo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(
    @Request() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('El archivo de imagen es requerido');
    }
    return this.companiesService.uploadLogo(req.user.sub, file);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Post('admin/for-user')
  createForUser(
    @Body() body: { userId: string; name: string; industry?: string },
  ) {
    return this.companiesService.create(body.userId, {
      name: body.name,
      industry: body.industry,
    });
  }

  @Get('employer/:employerId')
  findByEmployerId(@Param('employerId') employerId: string) {
    return this.companiesService.findByEmployerId(employerId);
  }
}
