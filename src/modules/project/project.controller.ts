import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  UseGuards,
  Inject,
} from "@nestjs/common";
import { IProjectService, ProjectService } from "./service/project.service";
import { Authorization } from "../auth/decorators/auth.decorator";
import { CreateProjectDto } from "./dto/create-project.dto";
import { Authorized } from "../auth/decorators/authorized.decorator";
import { UserRole } from "../user/types/roles.enum";
import { Project } from "./entity/project.entity";
import { MembershipAccessControlGuard } from "./membership/guards/member-access-control.guard";
import { MembershipRoles } from "./membership/decorators/membership.decorator";
import { MemberRole } from "./membership/types/member-role.enum";
import { UpdateProjectDTO } from "./dto/update-project.dto";
import { DeleteResult } from "typeorm";

@Controller("project")
export class ProjectController {
  constructor(
    @Inject("IProjectService")
    private readonly projectService: IProjectService,
  ) {}

  @Post("create")
  @Authorization()
  public async create(
    @Body() dto: CreateProjectDto,
    @Authorized("id") id: string,
  ) {
    return await this.projectService.create(dto, id);
  }

  @Post("getAll")
  @Authorization(UserRole.ADMIN)
  public async getAll(): Promise<Project[]> {
    return await this.projectService.getAll();
  }

  @Get("getByUser")
  @Authorization(UserRole.REGULAR, UserRole.ADMIN)
  public async getByUser(@Authorized("id") id: string): Promise<Project[]> {
    return await this.projectService.getByUser(id);
  }

  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN, MemberRole.MEMBER, MemberRole.VISITOR)
  @Get(":projectId")
  @Authorization(UserRole.REGULAR, UserRole.ADMIN)
  public async getById(@Param("projectId") id: string): Promise<Project> {
    return await this.projectService.getById(id);
  }

  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN, MemberRole.MEMBER)
  @Patch(":projectId")
  @Authorization(UserRole.REGULAR, UserRole.ADMIN)
  public async updateProject(
    @Param("projectId") id: string,
    @Body() dto: UpdateProjectDTO,
  ): Promise<Project> {
    return await this.projectService.updateById(id, dto);
  }

  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN, MemberRole.MEMBER)
  @Delete(":projectId")
  @Authorization(UserRole.REGULAR, UserRole.ADMIN)
  public async delete(@Param("projectId") id: string): Promise<DeleteResult> {
    return await this.projectService.deleteById(id);
  }
}
