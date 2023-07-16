import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './product';
import { AbstractService } from '../shared/abstract.service';

@Injectable()
export class ProductService extends AbstractService {
  constructor(@InjectRepository(Product) protected readonly repository) {
    super(repository);
  }

  async delete(id: number) {
    return this.repository.delete(id);
  }
}
