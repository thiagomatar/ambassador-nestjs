import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { faker } from '@faker-js/faker';
import * as process from 'process';
import { ProductService } from '../product/product.service';

(async () => {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productService = app.get(ProductService);

  for (let i = 0; i < 30; i++) {
    await productService.save({
      title: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      image: faker.image.url(),
      price: faker.commerce.price(),
    });
    console.log('Creating seed products');
  }
  process.exit();
})();
