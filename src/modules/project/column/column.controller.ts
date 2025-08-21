import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { ProjectColumnService } from "./column.service";
import { Authorization } from "../../auth/decorators/auth.decorator";
import { CreateColumnDTO } from "./dto/create-column.dto";
import { DeleteColumnDTO } from "./dto/delete-column.dto";
import { RenameColumnDTO } from "./dto/rename-column.dto";

@Controller("project_column")
export class ProjectColumnController {
  constructor(private readonly projectColumnService: ProjectColumnService) {}

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
}
