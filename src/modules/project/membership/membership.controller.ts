import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
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
import { MembershipService } from './services/membership.service';
import { MembershipInvitationService } from './services/membership-invitation.service';
import { MembershipAccessControlGuard } from './guards/member-access-control.guard';
import { MemberRole } from './types/member-role.enum';
import { MembershipRoles } from './decorators/membership.decorator';
import { Authorization } from '../../auth/decorators/auth.decorator';
import { SendInviteDTO } from './dto/send-invite.dto';
import { InviteDto } from './dto/invite.dto';
import { UpdateMembershipDTO } from './dto/update-member-role.dto';
import { Membership } from './entity/membership.entity';

@ApiTags('Memberships')
@ApiBearerAuth()
@Controller('project/:projectId/membership')
export class MembershipController {
  constructor(
    private readonly membershipService: MembershipService,
    private readonly membershipInvitationService: MembershipInvitationService,
  ) {}

  /**
   * Sends a project membership invitation to a user.
   */
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN)
  @Post('/invite')
  @HttpCode(HttpStatus.OK)
  @Authorization()
  @ApiOperation({ summary: 'Send an invitation to a user to join a project' })
  @ApiOkResponse({ description: 'Invitation successfully sent', type: Boolean })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Access denied' })
  @ApiBody({ type: SendInviteDTO })
  @ApiParam({ name: 'projectId', type: String, required: true })
  public async inviteUser(
    @Body() dto: SendInviteDTO,
    @Param('projectId') projectId: string,
  ): Promise<boolean> {
    return this.membershipInvitationService.sendVerificationToken(
      dto.email,
      projectId,
      dto.memberRole,
    );
  }

  /**
   * Accepts an invitation by validating the token and creating the membership.
   */
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN)
  @Post('/take-invite')
  @HttpCode(HttpStatus.OK)
  @Authorization()
  @ApiOperation({ summary: 'Accept an invitation to join the project' })
  @ApiOkResponse({ description: 'Invitation accepted' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Access denied' })
  @ApiBody({ type: InviteDto })
  @ApiParam({ name: 'projectId', type: String, required: true })
  public async newVerification(
    @Req() req: Request,
    @Body() dto: InviteDto,
  ): Promise<void> {
    return this.membershipInvitationService.newVerification(dto);
  }

  /**
   * Deletes a project member.
   */
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN)
  @Delete('/:userId')
  @HttpCode(HttpStatus.OK)
  @Authorization()
  @ApiOperation({ summary: 'Delete a project member' })
  @ApiOkResponse({ description: 'Member deleted', type: DeleteResult })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Access denied' })
  @ApiNotFoundResponse({ description: 'Member not found' })
  @ApiParam({ name: 'projectId', type: String, required: true })
  @ApiParam({ name: 'userId', type: String, required: true })
  public async deleteMember(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
  ): Promise<DeleteResult> {
    return this.membershipService.deleteProjectMember(userId, projectId);
  }

  /**
   * Updates the role of a project member.
   */
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN)
  @Patch('/update-member')
  @HttpCode(HttpStatus.OK)
  @Authorization()
  @ApiOperation({ summary: 'Update project member role' })
  @ApiOkResponse({ description: 'Member role updated', type: Membership })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Access denied' })
  @ApiBody({ type: UpdateMembershipDTO })
  @ApiParam({ name: 'projectId', type: String, required: true })
  public async updateMemberRole(
    @Param('projectId') projectId: string,
    @Body() dto: UpdateMembershipDTO,
  ): Promise<Membership> {
    return this.membershipService.updateUserAccess(
      dto.userId,
      projectId,
      dto.memberRole,
    );
  }
}
