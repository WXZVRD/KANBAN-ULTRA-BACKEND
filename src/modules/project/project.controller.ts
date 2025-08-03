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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectService } from './service/project.service';
import { Authorization } from '../auth/decorators/auth.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { Project } from './entity/project.entity';
import { Authorized } from '../auth/decorators/authorized.decorator';
import { UserRole } from '../user/types/roles.enum';
import { MembershipAccessControlGuard } from './membership/guards/member-access-control.guard';
import { MembershipRoles } from './membership/decorators/membership.decorator';
import { MemberRole } from './membership/types/member-role.enum';
import { UpdateProjectDTO } from './dto/update-project.dto';
import { ProjectMapSwagger } from './maps/project-map.swagger';
import { ApiAuthEndpoint } from '../../libs/common/decorators/api-swagger-simpli.decorator';

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
  @Post('getByUser')
  @Authorization(UserRole.REGULAR, UserRole.ADMIN)
  @ApiAuthEndpoint(ProjectMapSwagger.getByUser)
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
  @ApiAuthEndpoint(ProjectMapSwagger.getById)
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
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN, MemberRole.MEMBER)
  @Delete(':projectId')
  @Authorization(UserRole.REGULAR, UserRole.ADMIN)
  @ApiAuthEndpoint(ProjectMapSwagger.delete)
  public async delete(@Param('projectId') id: string): Promise<DeleteResult> {
    return await this.projectService.deleteById(id);
  }
}
