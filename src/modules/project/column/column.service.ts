import { Injectable, Logger } from '@nestjs/common';
import { ProjectColumnRepository } from './repository/column.repository';
import { ProjectColumn } from './entity/column.entity';
import { Project } from '../entity/project.entity';

@Injectable()
export class ProjectColumnService {
  private readonly logger = new Logger(ProjectColumnService.name);

  public constructor(
    private readonly projectColumnRepository: ProjectColumnRepository,
  ) {}

  public async createDefaultColumns(
    project: Project,
  ): Promise<ProjectColumn[]> {
    const defaultTitles: string[] = ['To Do', 'In Progress', 'Done'];

    this.logger.log(`Создание стандартных колонок для проекта: ${project.id}`);

    const createdColumns = await Promise.all(
      defaultTitles.map((title: string, index: number) =>
        this.projectColumnRepository.createAndSave({
          projectId: project.id,
          title,
          order: index,
        }),
      ),
    );

    this.logger.log(
      `Колонки созданы: ${createdColumns.map((c) => c.title).join(', ')}`,
    );

    return createdColumns;
  }
}
