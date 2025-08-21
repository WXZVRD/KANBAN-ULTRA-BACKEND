import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ProjectColumnRepository } from "./repository/column.repository";
import { ProjectColumn } from "./entity/column.entity";
import { Project } from "../entity/project.entity";
import { CreateColumnDTO } from "./dto/create-column.dto";
import { DeleteResult } from "typeorm";
import { RenameColumnDTO } from "./dto/rename-column.dto";

@Injectable()
export class ProjectColumnService {
  private readonly logger = new Logger(ProjectColumnService.name);

  public constructor(
    private readonly projectColumnRepository: ProjectColumnRepository,
  ) {}

  public async createDefaultColumns(
    project: Project,
  ): Promise<ProjectColumn[]> {
    const defaultTitles: string[] = ["To Do", "In Progress", "Done"];

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
      `Колонки созданы: ${createdColumns.map((c) => c.title).join(", ")}`,
    );

    return createdColumns;
  }

  public async createNewColumn(dto: CreateColumnDTO): Promise<ProjectColumn> {
    this.logger.debug(
      `Создание новой колонки: title="${dto.title}", order=${dto.order}, projectId=${dto.projectId}`,
    );

    const isSameColumn: ProjectColumn | null =
      await this.projectColumnRepository.findByTitleOrOrder(
        dto.title,
        dto.order,
        dto.projectId,
      );

    if (isSameColumn) {
      this.logger.warn(
        `Колонка с названием "${dto.title}" или позицией "${dto.order}" уже существует в проекте ID=${dto.projectId}`,
      );
      throw new ConflictException(
        "Колонка с таким названием или позицией уже существует.",
      );
    }

    const newColumn: ProjectColumn =
      await this.projectColumnRepository.createAndSave({
        projectId: dto.projectId,
        title: dto.title,
        order: dto.order,
      });

    this.logger.log(
      `Колонка успешно создана: id=${newColumn.id}, title="${newColumn.title}", projectId=${newColumn.projectId}`,
    );

    return newColumn;
  }

  public async getByProjectId(projectId: string): Promise<ProjectColumn[]> {
    const columns: ProjectColumn[] | null =
      await this.projectColumnRepository.findByProjectId(projectId);

    if (!columns || !columns.length) {
      this.logger.warn(
        `У проекта с id ${projectId} колонок нету, пожалуйста создайте хотя бы один`,
      );
      throw new NotFoundException(
        `У проекта с id ${projectId} колонок нету, пожалуйста создайте хотя бы один`,
      );
    }

    return columns;
  }

  public async deleteByProjectIdAndTitle(
    projectId: string,
    title: string,
  ): Promise<DeleteResult> {
    const column: ProjectColumn | null =
      await this.projectColumnRepository.findByProjectIdAndTitle(
        projectId,
        title,
      );

    if (!column) {
      this.logger.warn(`Колонки с названием ${title} не существует!`);
      throw new NotFoundException(
        `Колонки с названием ${title} не существует!`,
      );
    }

    const res = await this.projectColumnRepository.delete(projectId, title);

    return res;
  }

  public async renameColumn(
    columnId: string,
    body: RenameColumnDTO,
  ): Promise<any> {
    const column: ProjectColumn | null =
      await this.projectColumnRepository.findById(columnId);
    this.logger.log(`columnId ${columnId} !`);
    this.logger.log(`body.title ${body.title} !`);

    if (!column) {
      this.logger.warn(`Колонки с названием ${body.title} не существует!`);
      throw new NotFoundException(
        `Колонки с названием ${body.title} не существует!`,
      );
    }

    if (column.title === body.title) {
      this.logger.warn(`Колонки с названием ${body.title} уже существует!`);
      throw new NotFoundException(
        `Колонки с названием ${body.title} уже существует!`,
      );
    }

    Object.assign(column, body);
    const updated = await this.projectColumnRepository.save(column);
    return updated;
  }
}
