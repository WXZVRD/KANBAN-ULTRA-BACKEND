import { IsArray, IsEnum, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { MemberRole } from "../types/member-role.enum";

export class DeleteMembersDTO {
  @ApiProperty({
    example: "a1b2c3d4-uuid-user-id",
    description: "The ID of the user who becomes a member.",
  })
  @IsArray()
  ids: string[];
}
