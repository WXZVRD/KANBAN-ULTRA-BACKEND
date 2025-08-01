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

@Controller('project/:projectId/project_column')
export class ProjectColumnController {
  constructor(private readonly projectColumnService: ProjectColumnService) {}

  /**
   * Creates a new project column.
   *
   * @param dto - DTO containing column title, order, and project ID
   * @returns The created project column
   */
  @Post('newOne')
  @Authorization()
  public async newOne(@Body() dto: CreateColumnDTO): Promise<any> {
    return this.projectColumnService.createNewColumn(dto);
  }

  /**
   * Retrieves all columns for a specific project.
   *
   * Requires the user to have ADMIN or VISITOR role in the project.
   *
   * @param projectId - ID of the project to fetch columns for
   * @returns Array of ProjectColumn objects
   */
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN, MemberRole.VISITOR)
  @Get(':projectId')
  @Authorization()
  public async getByProjectId(
    @Param('projectId') projectId: string,
  ): Promise<ProjectColumn[]> {
    return this.projectColumnService.findByProjectId(projectId);
  }

  /**
   * Updates an existing project column.
   *
   * Requires the user to have ADMIN or VISITOR role.
   *
   * @param columnId - ID of the column to update
   * @param dto - DTO containing updated column data
   * @returns The updated ProjectColumn object
   */
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN, MemberRole.VISITOR)
  @Patch(':columnId')
  @Authorization()
  public async update(
    @Param('columnId') columnId: string,
    @Body() dto: UpdateColumnDTO,
  ): Promise<ProjectColumn> {
    return this.projectColumnService.update(columnId, dto);
  }

  /**
   * Moves a column to a new order in the project.
   *
   * Requires the user to have ADMIN or VISITOR role.
   *
   * @param columnId - ID of the column to move
   * @param dto - DTO containing new order information
   * @returns The moved ProjectColumn object
   */
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN, MemberRole.VISITOR)
  @Patch(':columnId/move-column')
  @Authorization()
  public async moveColumn(
    @Param('columnId') columnId: string,
    @Body() dto: MoveColumnDTO,
  ): Promise<ProjectColumn> {
    return this.projectColumnService.moveColumn(columnId, dto);
  }

  /**
   * Deletes a project column by its ID.
   *
   * Requires the user to have ADMIN or VISITOR role.
   *
   * @param columnId - ID of the column to delete
   * @returns DeleteResult indicating the operation result
   */
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN, MemberRole.VISITOR)
  @Delete(':columnId')
  @Authorization()
  public async deleteColumn(
    @Param('columnId') columnId: string,
  ): Promise<DeleteResult> {
    return this.projectColumnService.delete(columnId);
  }
}
