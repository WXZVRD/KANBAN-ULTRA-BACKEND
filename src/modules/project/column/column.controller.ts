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
import { IProjectColumnService, ProjectColumnService } from "./column.service";
import { Authorization } from "../../auth/decorators/auth.decorator";
import { CreateColumnDTO } from "./dto/create-column.dto";
import { DeleteColumnDTO } from "./dto/delete-column.dto";
import { RenameColumnDTO } from "./dto/rename-column.dto";
import { MoveColumnDTO } from "./dto/move-column.dto";

@Controller("project_column")
export class ProjectColumnController {
  constructor(
    @Inject("IProjectColumnService")
    private readonly projectColumnService: IProjectColumnService,
  ) {}

  @Post("newOne")
  @Authorization()
  public async newOne(@Body() dto: CreateColumnDTO): Promise<any> {
    return this.projectColumnService.createNewColumn(dto);
  }

  @Get(":projectId")
  @Authorization()
  public async getByProjectId(
    @Param("projectId") projectId: string,
  ): Promise<any> {
    return this.projectColumnService.getByProjectId(projectId);
  }

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
  @Post("/rename/:columnId")
  @Authorization()
  public async renameColumn(
    @Param("columnId") columnId: string,
    @Body() body: RenameColumnDTO,
  ): Promise<any> {
    return this.projectColumnService.renameColumn(columnId, body);
  }

  @Patch("/move/:columnId")
  @Authorization()
  public async move(
    @Param("columnId") columnId: string,
    @Body() body: MoveColumnDTO,
  ): Promise<any> {
    return this.projectColumnService.move(columnId, body);
  }
}
