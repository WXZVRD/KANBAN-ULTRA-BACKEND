import { Body, Controller, Post } from '@nestjs/common';
import { ProjectService } from './service/project.service';
import { Authorization } from '../auth/decorators/auth.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { Authorized } from '../auth/decorators/authorized.decorator';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post('create')
  @Authorization()
  public async create(
    @Body() dto: CreateProjectDto,
    @Authorized('id') id: string,
  ) {
    return await this.projectService.create(dto, id);
  }
}
