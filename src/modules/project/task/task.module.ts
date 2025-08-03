import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipModule } from '../membership/membership.module';
import { UserModule } from '../../user/user.module';
import { Task } from './entity/task.entity';
import { TaskController } from './task.controller';
import { TaskService } from './service/task.service';
import { TaskRepository } from './repository/task.repository';
import { RedisModule } from '../../redis/redis.module';
import { MailModule } from '../../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    UserModule,
    MembershipModule,
    RedisModule,
    MailModule,
  ],
  controllers: [TaskController],
  providers: [
    {
      provide: 'ITaskService',
      useClass: TaskService,
    },
    {
      provide: 'ITaskRepository',
      useClass: TaskRepository,
    },
  ],
})
export class TaskModule {}
