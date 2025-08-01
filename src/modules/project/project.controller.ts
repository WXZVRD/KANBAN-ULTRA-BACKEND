import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from './service/project.service';
import { Authorization } from '../auth/decorators/auth.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { Authorized } from '../auth/decorators/authorized.decorator';
import { UserRole } from '../user/types/roles.enum';
import { Project } from './entity/project.entity';
import { MembershipAccessControlGuard } from './membership/guards/member-access-control.guard';
import { MembershipRoles } from './membership/decorators/membership.decorator';
import { MemberRole } from './membership/types/member-role.enum';
import { UpdateProjectDTO } from './dto/update-project.dto';
import { DeleteResult } from 'typeorm';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  /**
   * Creates a new project for the authenticated user.
   *
   * Requires the user to be authorized.
   *
   * @param dto - Data Transfer Object containing the project creation data
   * @param id - The ID of the authenticated user
   * @returns The created project entity
   */
  @Post('create')
  @Authorization()
  public async create(
    @Body() dto: CreateProjectDto,
    @Authorized('id') id: string,
  ): Promise<Project> {
    return await this.projectService.create(dto, id);
  }

  /**
   * Retrieves all projects in the system.
   *
   * Only available for users with the ADMIN role.
   *
   * @returns An array of all projects
   */
  @Post('getAll')
  @Authorization(UserRole.ADMIN)
  public async getAll(): Promise<Project[]> {
    return await this.projectService.getAll();
  }

  /**
   * Retrieves all projects that belong to the authenticated user.
   *
   * Accessible for both REGULAR and ADMIN users.
   *
   * @param id - The ID of the authenticated user
   * @returns A list of the user's projects
   */
  @Post('getByUser')
  @Authorization(UserRole.REGULAR, UserRole.ADMIN)
  public async getByUser(@Authorized('id') id: string): Promise<Project[]> {
    return await this.projectService.getByUser(id);
  }

  /**
   * Retrieves a specific project by its ID.
   *
   * Requires membership in the project with at least VISITOR role.
   * Accessible for both REGULAR and ADMIN users.
   *
   * @param id - The ID of the project
   * @returns The project entity if found
   */
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN, MemberRole.MEMBER, MemberRole.VISITOR)
  @Get(':projectId')
  @Authorization(UserRole.REGULAR, UserRole.ADMIN)
  public async getById(@Param('projectId') id: string): Promise<Project> {
    return await this.projectService.getById(id);
  }

  /**
   * Updates an existing project by its ID.
   *
   * Requires the user to be at least a MEMBER in the project.
   * Accessible for both REGULAR and ADMIN users.
   *
   * @param id - The ID of the project to update
   * @param dto - Data Transfer Object containing the updated project data
   * @returns The updated project entity
   */
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN, MemberRole.MEMBER)
  @Patch(':projectId')
  @Authorization(UserRole.REGULAR, UserRole.ADMIN)
  public async updateProject(
    @Param('projectId') id: string,
    @Body() dto: UpdateProjectDTO,
  ): Promise<Project> {
    return await this.projectService.updateById(id, dto);
  }

  /**
   * Deletes a project by its ID.
   *
   * Requires the user to be at least a MEMBER in the project.
   * Accessible for both REGULAR and ADMIN users.
   *
   * @param id - The ID of the project to delete
   * @returns The result of the delete operation
   */
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN, MemberRole.MEMBER)
  @Delete(':projectId')
  @Authorization(UserRole.REGULAR, UserRole.ADMIN)
  public async delete(@Param('projectId') id: string): Promise<DeleteResult> {
    return await this.projectService.deleteById(id);
  }
}
