import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task, TaskController, TaskRepository, TaskService } from './index';
import { UserModule } from '../../user';
import { MembershipModule } from '../membership';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), UserModule, MembershipModule],
  controllers: [TaskController],
  providers: [TaskService, TaskRepository],
})
export class TaskModule {}
