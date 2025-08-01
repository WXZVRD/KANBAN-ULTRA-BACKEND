import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProjectColumnService } from './column.service';
import { Authorization } from '../../auth/decorators/auth.decorator';
import { CreateColumnDTO } from './dto/create-column.dto';
import { MembershipAccessControlGuard } from '../membership/guards/member-access-control.guard';
import { MembershipRoles } from '../membership/decorators/membership.decorator';
import { MemberRole } from '../membership/types/member-role.enum';
import { ProjectColumn } from './entity/column.entity';
import { UpdateColumnDTO } from './dto/update-column.dto';
import { MoveColumnDTO } from './dto/move-column.dto';
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
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Project Columns')
@ApiBearerAuth()
@Controller('project/:projectId/project_column')
export class ProjectColumnController {
  constructor(private readonly projectColumnService: ProjectColumnService) {}

  /**
   * Creates a new project column.
   */
  @Post('newOne')
  @Authorization()
  @ApiOperation({ summary: 'Create a new project column' })
  @ApiOkResponse({
    description: 'Column created successfully',
    type: ProjectColumn,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Access denied' })
  @ApiBody({ type: CreateColumnDTO })
  public async newOne(@Body() dto: CreateColumnDTO): Promise<any> {
    return this.projectColumnService.createNewColumn(dto);
  }

  /**
   * Retrieves all columns for a specific project.
   */
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN, MemberRole.VISITOR)
  @Get(':projectId')
  @Authorization()
  @ApiOperation({ summary: 'Get all columns for a project' })
  @ApiOkResponse({
    description: 'Columns fetched successfully',
    type: [ProjectColumn],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Access denied' })
  @ApiParam({ name: 'projectId', type: String, required: true })
  public async getByProjectId(
    @Param('projectId') projectId: string,
  ): Promise<ProjectColumn[]> {
    return this.projectColumnService.findByProjectId(projectId);
  }

  /**
   * Updates an existing project column.
   */
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN, MemberRole.VISITOR)
  @Patch(':columnId')
  @Authorization()
  @ApiOperation({ summary: 'Update a project column' })
  @ApiOkResponse({
    description: 'Column updated successfully',
    type: ProjectColumn,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Access denied' })
  @ApiNotFoundResponse({ description: 'Column not found' })
  @ApiParam({ name: 'columnId', type: String, required: true })
  @ApiBody({ type: UpdateColumnDTO })
  public async update(
    @Param('columnId') columnId: string,
    @Body() dto: UpdateColumnDTO,
  ): Promise<ProjectColumn> {
    return this.projectColumnService.update(columnId, dto);
  }

  /**
   * Moves a column to a new order in the project.
   */
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN, MemberRole.VISITOR)
  @Patch(':columnId/move-column')
  @Authorization()
  @ApiOperation({ summary: 'Move column to new position' })
  @ApiOkResponse({
    description: 'Column moved successfully',
    type: ProjectColumn,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Access denied' })
  @ApiParam({ name: 'columnId', type: String, required: true })
  @ApiBody({ type: MoveColumnDTO })
  public async moveColumn(
    @Param('columnId') columnId: string,
    @Body() dto: MoveColumnDTO,
  ): Promise<ProjectColumn> {
    return this.projectColumnService.moveColumn(columnId, dto);
  }

  /**
   * Deletes a project column by its ID.
   */
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN, MemberRole.VISITOR)
  @Delete(':columnId')
  @Authorization()
  @ApiOperation({ summary: 'Delete a project column' })
  @ApiOkResponse({
    description: 'Column deleted successfully',
    type: DeleteResult,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Access denied' })
  @ApiNotFoundResponse({ description: 'Column not found' })
  @ApiParam({ name: 'columnId', type: String, required: true })
  public async deleteColumn(
    @Param('columnId') columnId: string,
  ): Promise<DeleteResult> {
    return this.projectColumnService.delete(columnId);
  }
}
