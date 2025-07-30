import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
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

@Controller('membership')
export class MembershipController {
  constructor(
    private readonly membershipService: MembershipService,
    private readonly membershipInvitationService: MembershipInvitationService,
  ) {}

  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN)
  @Post('/invite')
  @HttpCode(HttpStatus.OK)
  @Authorization()
  public async inviteUser(@Body() dto: SendInviteDTO): Promise<boolean> {
    return this.membershipInvitationService.sendVerificationToken(
      dto.email,
      dto.projectId,
      dto.memberRole,
    );
  }

  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN)
  @Post('/take-invite')
  @HttpCode(HttpStatus.OK)
  @Authorization()
  public async newVerification(
    @Req() req: Request,
    @Body() dto: InviteDto,
  ): Promise<boolean> {
    return this.membershipInvitationService.newVerification(req, dto);
  }
}
