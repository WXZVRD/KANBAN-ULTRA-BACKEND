import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../../user/entity/user.entity';
import { Project } from '../../entity/project.entity';
import { MemberRole } from '../types/member-role.enum';

@Entity('membership')
export class Membership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.memberships, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Project, (project) => project.memberships, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  projectId: string;

  @Column({
    enum: MemberRole,
    default: MemberRole.VISITOR,
  })
  memberRole: MemberRole;
}
