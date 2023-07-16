import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderItem } from './order-item';
import { Exclude, Expose } from 'class-transformer';
import { Link } from '../link/link';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  transaction_id: string;

  @Column()
  user_id: number;

  @Column()
  code: string;

  @Column()
  ambassador_email: string;

  @Exclude()
  @Column()
  first_name: string;

  @Exclude()
  @Column()
  last_name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  zip: string;

  @Exclude()
  @Column({ default: true })
  complete: boolean;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems: OrderItem[];

  @ManyToOne(() => Link, (link) => link.order, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({
    referencedColumnName: 'code',
    name: 'code',
  })
  link: Link;

  @Expose()
  get name() {
    return `${this.first_name} ${this.last_name}`;
  }
  @Expose()
  get total(): number {
    return this.orderItems.reduce((s, i) => s + i.admin_revenue, 0);
  }
}