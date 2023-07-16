import { Repository } from 'typeorm';

export abstract class AbstractService {
  protected constructor(protected readonly repository: Repository<any>) {}

  async save(options) {
    return this.repository.save(options);
  }

  async findOne(options) {
    return this.repository.findOne({ where: options });
  }

  async update(id: number, options) {
    await this.repository.update(id, options);
    return this.repository.findOne({ where: { id } });
  }

  async find(options = {}) {
    return this.repository.find(options);
  }
}
