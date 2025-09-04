import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { IProjectColumnService } from "./column.service";
import { Authorization } from "../../auth/decorators/auth.decorator";
import { CreateColumnDTO } from "./dto/create-column.dto";
import { DeleteColumnDTO } from "./dto/delete-column.dto";
import { RenameColumnDTO } from "./dto/rename-column.dto";
import { MoveColumnDTO } from "./dto/move-column.dto";
import { ProjectColumn } from "./entity/column.entity";

@Controller("project_column")
export class ProjectColumnController {
  constructor(
    @Inject("IProjectColumnService")
    private readonly projectColumnService: IProjectColumnService,
  ) {}

  /**
   * Creates a new column in a project.
   * @param dto - DTO containing projectId, title, and order
   * @returns Created ProjectColumn entity
   */
  @Post("newOne")
  @Authorization()
  public async newOne(@Body() dto: CreateColumnDTO): Promise<ProjectColumn> {
    return this.projectColumnService.createNewColumn(dto);
  }

  /**
   * Retrieves all columns for a specific project.
   * @param projectId - Project ID
   * @returns Array of ProjectColumn entities
   */
  @Get(":projectId")
  @Authorization()
  public async getByProjectId(
    @Param("projectId") projectId: string,
  ): Promise<ProjectColumn[]> {
    return this.projectColumnService.getByProjectId(projectId);
  }

  /**
   * Deletes a column in a project by title.
   * @param projectId - Project ID
   * @param body - DTO containing the column title to delete
   * @returns DeleteResult or confirmation
   */
  @Delete(":projectId")
  @Authorization()
  public async deleteByProjectId(
    @Param("projectId") projectId: string,
    @Body() body: DeleteColumnDTO,
  ): Promise<any> {
    return this.projectColumnService.deleteByProjectIdAndTitle(
      projectId,
      body.title,
    );
  }

  /**
   * Renames a column.
   * @param columnId - Column ID
   * @param body - DTO containing the new title
   * @returns Updated ProjectColumn entity
   */
  @Post("/rename/:columnId")
  @Authorization()
  public async renameColumn(
    @Param("columnId") columnId: string,
    @Body() body: RenameColumnDTO,
  ): Promise<ProjectColumn> {
    return this.projectColumnService.renameColumn(columnId, body);
  }

  /**
   * Moves a column to a new order within the project.
   * @param columnId - Column ID
   * @param body - DTO containing the new order
   * @returns Updated ProjectColumn entity
   */
  @Patch("/move/:columnId")
  @Authorization()
  public async move(
    @Param("columnId") columnId: string,
    @Body() body: MoveColumnDTO,
  ): Promise<ProjectColumn> {
    return this.projectColumnService.move(columnId, body);
  }
}
