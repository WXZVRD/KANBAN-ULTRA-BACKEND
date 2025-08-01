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
import { MembershipService } from './services/membership.service';
import { MembershipInvitationService } from './services/membership-invitation.service';
import { SendInviteDTO } from './dto/send-invite.dto';
import { Request } from 'express';
import { InviteDto } from './dto/invite.dto';
import { Authorization } from '../../auth/decorators/auth.decorator';
import { MembershipAccessControlGuard } from './guards/member-access-control.guard';
import { MembershipRoles } from './decorators/membership.decorator';
import { MemberRole } from './types/member-role.enum';
import { DeleteResult } from 'typeorm';
import { UpdateMembershipDTO } from './dto/update-member-role.dto';
import { Membership } from './entity/membership.entity';

@Controller('project/:projectId/membership')
export class MembershipController {
  constructor(
    private readonly membershipService: MembershipService,
    private readonly membershipInvitationService: MembershipInvitationService,
  ) {}

  /**
   * Sends a project membership invitation to a user.
   *
   * @param dto - DTO containing email and desired member role
   * @param projectId - Project ID
   * @returns True if the invitation was successfully sent
   */
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN)
  @Post('/invite')
  @HttpCode(HttpStatus.OK)
  @Authorization()
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
   *
   * @param req - Request object
   * @param dto - DTO containing invite token
   */
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN)
  @Post('/take-invite')
  @HttpCode(HttpStatus.OK)
  @Authorization()
  public async newVerification(
    @Req() req: Request,
    @Body() dto: InviteDto,
  ): Promise<void> {
    return this.membershipInvitationService.newVerification(dto);
  }

  /**
   * Deletes a project member.
   *
   * @param projectId - Project ID
   * @param userId - User ID to delete
   * @returns DeleteResult
   */
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN)
  @Delete('/:userId')
  @HttpCode(HttpStatus.OK)
  @Authorization()
  public async deleteMember(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
  ): Promise<DeleteResult> {
    return this.membershipService.deleteProjectMember(userId, projectId);
  }

  /**
   * Updates the role of a project member.
   *
   * @param projectId - Project ID
   * @param dto - DTO with new role
   * @returns Updated Membership entity
   */
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN)
  @Patch('/update-member')
  @HttpCode(HttpStatus.OK)
  @Authorization()
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
