import { DeleteResult } from "typeorm";
import { Membership } from "../entity/membership.entity";
import { SendInviteDTO } from "../dto/send-invite.dto";
import { InviteDto } from "../dto/invite.dto";
import { UpdateMembershipDTO } from "../dto/update-member-role.dto";
import { SwaggerMap } from "../../../../libs/common/types/swagger-map.type";
import { MembershipController } from "../membership.controller";

export const MembershipMapSwagger: SwaggerMap<MembershipController> = {
  inviteUser: {
    summary: "Send an invitation to a user to join a project",
    okDescription: "Invitation successfully sent",
    okType: Boolean,
    bodyType: SendInviteDTO,
  },

  deleteArrayOfMembers: {
    summary: "Send an invitation to a user to join a project",
    okDescription: "Invitation successfully sent",
    okType: Boolean,
    bodyType: SendInviteDTO,
  },

  getProjectByMember: {
    summary: "Send an invitation to a user to join a project",
    okDescription: "Invitation successfully sent",
    okType: Boolean,
    bodyType: SendInviteDTO,
  },

  newVerification: {
    summary: "Accept an invitation to join the project",
    okDescription: "Invitation accepted",
    okType: Boolean,
    bodyType: InviteDto,
  },

  deleteMember: {
    summary: "Delete a project member",
    okDescription: "Member deleted",
    okType: DeleteResult,
  },

  updateMemberRole: {
    summary: "Update project member role",
    okDescription: "Member role updated",
    okType: Membership,
    bodyType: UpdateMembershipDTO,
  },

  getProjectMembers: {
    summary: "Update project member role",
    okDescription: "Member role updated",
    okType: Membership,
    bodyType: UpdateMembershipDTO,
  },
};
