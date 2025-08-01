import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TaskPriority } from '../types/priority.enum';
import { User } from '../../../user/entity/user.entity';
import { ProjectColumn } from '../../column/entity/column.entity';
import { Project } from '../../entity/project.entity';

@Entity('task')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({
    type: 'varchar',
    default: null,
    nullable: true,
  })
  description: string;

  @Column({
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @ManyToOne(() => User, (user) => user.tasks, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  authorId: string;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'assigneeId' })
  assignee?: User;

  @Column({
    nullable: true,
  })
  assigneeId?: string;

  @ManyToOne(() => ProjectColumn, (column) => column.tasks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'columnId' })
  column: ProjectColumn;

  @Column()
  columnId: string;

  @ManyToOne(() => Project, (project) => project.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  projectId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
