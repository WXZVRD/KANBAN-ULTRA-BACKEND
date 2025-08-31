import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User } from "../../user/entity/user.entity";

export const Authorized = createParamDecorator(
  (data: keyof User, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    console.log("[Authorized decorator] user:", user);
    if (data) {
      console.log(
        `[Authorized decorator] returning field: ${data} =`,
        user?.[data],
      );
    }

    return data ? user?.[data] : user;
  },
);
