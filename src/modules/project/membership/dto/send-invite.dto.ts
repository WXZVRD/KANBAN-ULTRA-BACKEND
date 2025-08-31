import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { MemberRole } from "../types/member-role.enum";

export class SendInviteDTO {
  @ApiProperty({
    example: "user@example.com",
    description: "The email address to send the invitation to.",
  })
  @IsString({ message: "Емаил должен быть строкой" })
  @IsNotEmpty({ message: "Поле емаил не может быть пустым" })
  email: string;

  @ApiProperty({
    enum: MemberRole,
    example: MemberRole.VISITOR,
    description: "The role that will be assigned to the invited user.",
  })
  @IsNotEmpty({ message: "Поле memberRole не может быть пустым" })
  @IsEnum(MemberRole)
  memberRole: MemberRole;
}
