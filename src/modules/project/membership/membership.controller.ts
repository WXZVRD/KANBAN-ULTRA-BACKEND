import { Controller } from '@nestjs/common';
import { MembershipService } from './services/membership.service';

@Controller('membership')
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}
}
