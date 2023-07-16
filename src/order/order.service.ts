import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './order';
import { Repository } from 'typeorm';
import { AbstractService } from '../shared/abstract.service';

@Injectable()
export class OrderService extends AbstractService {
  constructor(
    @InjectRepository(Order) protected repository: Repository<Order>,
  ) {
    super(repository);
  }
}
