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
import { DeleteResult } from 'typeorm';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBody,
} from '@nestjs/swagger';
import {
  CreateProjectDto,
  Project,
  ProjectService,
  UpdateProjectDTO,
} from './index';
import { Authorization, Authorized } from '../auth';
import { UserRole } from '../user';
import {
  MemberRole,
  MembershipAccessControlGuard,
  MembershipRoles,
} from './membership';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  /**
   * Creates a new project for the authenticated user.
   */
  @Post('create')
  @Authorization()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiOkResponse({ description: 'Project successfully created', type: Project })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBody({ type: CreateProjectDto })
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
  @ApiOperation({ summary: 'Get all projects (Admin only)' })
  @ApiOkResponse({ description: 'List of all projects', type: [Project] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Only admins can access this endpoint' })
  public async getAll(): Promise<Project[]> {
    return await this.projectService.getAll();
  }

  /**
   * Retrieves all projects that belong to the authenticated user.
   */
  @Post('getByUser')
  @Authorization(UserRole.REGULAR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all projects of the current user' })
  @ApiOkResponse({ description: 'List of user projects', type: [Project] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  public async getByUser(@Authorized('id') id: string): Promise<Project[]> {
    return await this.projectService.getByUser(id);
  }

  /**
   * Retrieves a specific project by its ID.
   */
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN, MemberRole.MEMBER, MemberRole.VISITOR)
  @Get(':projectId')
  @Authorization(UserRole.REGULAR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiOkResponse({ description: 'Project found', type: Project })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Access denied for this project' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  public async getById(@Param('projectId') id: string): Promise<Project> {
    return await this.projectService.getById(id);
  }

  /**
   * Updates an existing project by its ID.
   */
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN, MemberRole.MEMBER)
  @Patch(':projectId')
  @Authorization(UserRole.REGULAR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update project by ID' })
  @ApiOkResponse({ description: 'Project successfully updated', type: Project })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Access denied for this project' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiBody({ type: UpdateProjectDTO })
  public async updateProject(
    @Param('projectId') id: string,
    @Body() dto: UpdateProjectDTO,
  ): Promise<Project> {
    return await this.projectService.updateById(id, dto);
  }

  /**
   * Deletes a project by its ID.
   */
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN, MemberRole.MEMBER)
  @Delete(':projectId')
  @Authorization(UserRole.REGULAR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete project by ID' })
  @ApiOkResponse({
    description: 'Project successfully deleted',
    type: DeleteResult,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Access denied for this project' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  public async delete(@Param('projectId') id: string): Promise<DeleteResult> {
    return await this.projectService.deleteById(id);
  }
}
