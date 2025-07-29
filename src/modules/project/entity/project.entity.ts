import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AccessType } from '../types/access.enum';
import { User } from '../../user/entity/user.entity';
import { ProjectColumn } from '../column/entity/column.entity';

@Entity('project')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({
    enum: AccessType,
    default: AccessType.PUBLIC,
  })
  accessType: AccessType;

  @ManyToOne(() => User, (user) => user.projects, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column()
  ownerId: string;

  @OneToMany(() => ProjectColumn, (column) => column.project, {
    cascade: true,
  })
  columns: ProjectColumn[];
}
