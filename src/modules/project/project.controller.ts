import { Controller } from '@nestjs/common';
import { ProjectService } from './service/project.service';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}
}
