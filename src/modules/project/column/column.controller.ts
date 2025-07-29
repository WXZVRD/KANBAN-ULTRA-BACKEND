import { Body, Controller, Post } from '@nestjs/common';
import { ProjectColumnService } from './column.service';
import { Authorization } from '../../auth/decorators/auth.decorator';
import { CreateColumnDTO } from './dto/create-column.dto';

@Controller('project_column')
export class ProjectColumnController {
  constructor(private readonly projectColumnService: ProjectColumnService) {}

  @Post('newOne')
  @Authorization()
  public async newOne(@Body() dto: CreateColumnDTO): Promise<any> {
    return this.projectColumnService.createNewColumn(dto);
  }
}
