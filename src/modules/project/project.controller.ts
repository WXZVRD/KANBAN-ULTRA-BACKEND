import { DeleteResult } from 'typeorm';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IProjectService, ProjectService } from './service/project.service';
import { UserRole } from '../user/types/roles.enum';
import { ApiAuthEndpoint } from '../../libs/common/decorators/api-swagger-simpli.decorator';
import { MemberACL, MemberRole } from './membership';
import { Authorization, Authorized } from '../auth';
import {
  CreateProjectDto,
  Project,
  ProjectMapSwagger,
  UpdateProjectDTO,
} from './index';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('project')
export class ProjectController {
  constructor(
    @Inject('IProjectService')
    private readonly projectService: IProjectService,
  ) {}

  /**
   * Creates a new project for the authenticated user.
   */
  @Post('create')
  @Authorization()
  @ApiAuthEndpoint(ProjectMapSwagger.create)
  public async create(
    @Body() dto: CreateProjectDto,
    @Authorized('id') id: string,
  ): Promise<Project> {
    return await this.projectService.create(dto, id);
  }

  /**
   * Retrieves all projects in the system.
   */
  @Post('getAll')
  @Authorization(UserRole.ADMIN)
  @ApiAuthEndpoint(ProjectMapSwagger.getAll)
  public async getAll(): Promise<Project[]> {
    return await this.projectService.getAll();
  }

  /**
   * Retrieves all projects that belong to the authenticated user.
   */
  @Authorization(UserRole.REGULAR, UserRole.ADMIN)
  @Post('getByUser')
  @ApiAuthEndpoint(ProjectMapSwagger.getByUser)
  public async getByUser(@Authorized('id') id: string): Promise<Project[]> {
    return await this.projectService.getByUser(id);
  }

  /**
   * Retrieves a specific project by its ID.
   */
  @MemberACL(MemberRole.ADMIN, MemberRole.MEMBER, MemberRole.VISITOR)
  @Authorization(UserRole.REGULAR, UserRole.ADMIN)
  @Get(':projectId')
  @ApiAuthEndpoint(ProjectMapSwagger.getById)
  public async getById(@Param('projectId') id: string): Promise<Project> {
    return await this.projectService.getById(id);
  }

  /**
   * Updates an existing project by its ID.
   */
  @MemberACL(MemberRole.ADMIN, MemberRole.MEMBER)
  @Authorization(UserRole.REGULAR, UserRole.ADMIN)
  @Patch(':projectId')
  @ApiAuthEndpoint(ProjectMapSwagger.updateProject)
  public async updateProject(
    @Param('projectId') id: string,
    @Body() dto: UpdateProjectDTO,
  ): Promise<Project> {
    return await this.projectService.updateById(id, dto);
  }

  /**
   * Deletes a project by its ID.
   */
  @MemberACL(MemberRole.ADMIN, MemberRole.MEMBER)
  @Authorization(UserRole.REGULAR, UserRole.ADMIN)
  @Delete(':projectId')
  @ApiAuthEndpoint(ProjectMapSwagger.delete)
  public async delete(@Param('projectId') id: string): Promise<DeleteResult> {
    return await this.projectService.deleteById(id);
  }
}
