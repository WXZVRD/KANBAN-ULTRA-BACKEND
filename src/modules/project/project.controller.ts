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
import { IProjectService } from "./service/project.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UserRole } from "../user/types/roles.enum";
import { Project } from "./entity/project.entity";
import { UpdateProjectDTO } from "./dto/update-project.dto";
import { DeleteResult } from "typeorm";
import { Authorization, Authorized } from "../auth";
import {
  MemberRole,
  MembershipAccessControlGuard,
  MembershipRoles,
} from "./membership";

@Controller("project")
export class ProjectController {
  constructor(
    @Inject("IProjectService")
    private readonly projectService: IProjectService,
  ) {}

  /**
   * Creates a new project.
   *
   * @param dto Data transfer object containing project details
   * @param id ID of the authorized user creating the project
   * @returns The created Project entity
   */
  @Post("create")
  @Authorization()
  public async create(
    @Body() dto: CreateProjectDto,
    @Authorized("id") id: string,
  ): Promise<Project> {
    return await this.projectService.create(dto, id);
  }

  /**
   * Retrieves all projects (admin only).
   *
   * @returns Array of all Project entities
   */
  @Post("getAll")
  @Authorization(UserRole.ADMIN)
  public async getAll(): Promise<Project[]> {
    return await this.projectService.getAll();
  }

  /**
   * Retrieves projects for the authorized user.
   *
   * @param id ID of the authorized user
   * @returns Array of Project entities belonging to the user
   */
  @Get("getByUser")
  @Authorization(UserRole.REGULAR, UserRole.ADMIN)
  public async getByUser(@Authorized("id") id: string): Promise<Project[]> {
    return await this.projectService.getByUser(id);
  }

  /**
   * Retrieves a specific project by ID.
   * Requires membership in the project.
   *
   * @param id Project ID
   * @returns The Project entity
   */
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN, MemberRole.MEMBER, MemberRole.VISITOR)
  @Get(":projectId")
  @Authorization(UserRole.REGULAR, UserRole.ADMIN)
  public async getById(@Param("projectId") id: string): Promise<Project> {
    return await this.projectService.getById(id);
  }

  /**
   * Updates a project by ID.
   * Requires membership with admin or member role.
   *
   * @param id Project ID
   * @param dto Data transfer object containing updated project details
   * @returns The updated Project entity
   */
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

  /**
   * Deletes a project by ID.
   * Requires membership with admin or member role.
   *
   * @param id Project ID
   * @returns DeleteResult containing deletion status
   */
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN, MemberRole.MEMBER)
  @Delete(":projectId")
  @Authorization(UserRole.REGULAR, UserRole.ADMIN)
  public async delete(@Param("projectId") id: string): Promise<DeleteResult> {
    return await this.projectService.deleteById(id);
  }
}
