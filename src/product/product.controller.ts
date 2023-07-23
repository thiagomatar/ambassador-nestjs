import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductCreateDto } from './dtos/product-create.dto';
import { ProductService } from './product.service';
import { AuthGuard } from '../auth/auth.guard';
import { CACHE_MANAGER, CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller()
export class ProductController {
  constructor(
    private readonly service: ProductService,
    private eventEmitter: EventEmitter2,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  @UseGuards(AuthGuard)
  @Get('admin/products')
  async all() {
    return this.service.find({});
  }

  @UseGuards(AuthGuard)
  @Post('admin/products')
  async create(@Body() body: ProductCreateDto) {
    const product = await this.service.save(body);
    this.eventEmitter.emit('product_updated');
    return product;
  }

  @UseGuards(AuthGuard)
  @Get('admin/products/:id')
  async get(@Param('id') id: number) {
    return this.service.findOne({ id });
  }

  @UseGuards(AuthGuard)
  @Put('admin/products/:id')
  async update(@Param('id') id: number, @Body() body: ProductCreateDto) {
    await this.service.update(id, body);
    
    const product = await this.service.findOne({ where: { id } });
    this.eventEmitter.emit('product_updated');
    return product;
  }

  @UseGuards(AuthGuard)
  @Delete('admin/products/:id')
  async delete(@Param('id') id: number) {
    return this.service.delete(id);
  }

  @CacheKey('products_frontend')
  @CacheTTL(30 * 60)
  @UseInterceptors(CacheInterceptor)
  @Get('ambassador/products/frontend')
  async frontend() {
    return this.service.find();
  }

  @Get('ambassador/products/backend')
  async backend() {
    let products = await this.cacheManager.get('products_backend');
    if (!products) {
      products = await this.service.find();
      await this.cacheManager.set('products_backend', products, 20000);
    }
    return products;
  }
}
