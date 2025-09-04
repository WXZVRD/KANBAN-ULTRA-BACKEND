import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { IProjectColumnRepository } from "./repository/column.repository";
import { ProjectColumn } from "./entity/column.entity";
import { Project } from "../entity/project.entity";
import { CreateColumnDTO } from "./dto/create-column.dto";
import { DeleteResult } from "typeorm";
import { RenameColumnDTO } from "./dto/rename-column.dto";
import { MoveColumnDTO } from "./dto/move-column.dto";

export interface IProjectColumnService {
  createDefaultColumns(project: Project): Promise<ProjectColumn[]>;
  createNewColumn(dto: CreateColumnDTO): Promise<ProjectColumn>;
  getByProjectId(projectId: string): Promise<ProjectColumn[]>;
  deleteByProjectIdAndTitle(
    projectId: string,
    title: string,
  ): Promise<DeleteResult>;
  renameColumn(columnId: string, body: RenameColumnDTO): Promise<ProjectColumn>;
  move(columnId: string, body: MoveColumnDTO): Promise<ProjectColumn>;
}

@Injectable()
export class ProjectColumnService implements IProjectColumnService {
  private readonly logger = new Logger(ProjectColumnService.name);

  public constructor(
    @Inject("IProjectColumnRepository")
    private readonly projectColumnRepository: IProjectColumnRepository,
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
  ): Promise<ProjectColumn> {
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
    const updated: ProjectColumn =
      await this.projectColumnRepository.save(column);
    return updated;
  }

  public async move(columnId: string, body: MoveColumnDTO): Promise<any> {
    this.logger.log(
      `Move column request: columnId=${columnId}, body=${JSON.stringify(body)}`,
    );

    const column = await this.projectColumnRepository.findById(columnId);
    this.logger.debug(`Found column: ${JSON.stringify(column)}`);

    if (!column) {
      this.logger.warn(`Column with id=${columnId} not found`);
      throw new NotFoundException("Column not found");
    }

    const oldOrder: number = column.order;
    const newOrder: number = body.order;

    this.logger.log(`Orders: oldOrder=${oldOrder}, newOrder=${newOrder}`);

    if (oldOrder === newOrder) {
      this.logger.log(`Order not changed, returning column`);
      return column;
    }

    this.logger.log(
      `Reordering columns for projectId=${column.projectId}, oldOrder=${oldOrder}, newOrder=${newOrder}, columnId=${column.id}`,
    );

    await this.projectColumnRepository.reorderColumns(
      column.projectId,
      oldOrder,
      newOrder,
      column.id,
    );

    column.order = newOrder;
    const saved: ProjectColumn =
      await this.projectColumnRepository.save(column);

    this.logger.log(`Column saved with new order: ${JSON.stringify(saved)}`);
    return saved;
  }
}
