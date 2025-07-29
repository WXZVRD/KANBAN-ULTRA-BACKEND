import { Controller } from '@nestjs/common';
import { ProjectColumnService } from './column.service';

@Controller('column')
export class ProjectColumnController {
  constructor(private readonly projectColumnService: ProjectColumnService) {}
}
