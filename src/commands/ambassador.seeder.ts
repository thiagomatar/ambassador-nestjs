import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserService } from '../user/user.service';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';
import * as process from 'process';

(async () => {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);

  const password = await bcrypt.hash('1234', 12);

  for (let i = 0; i < 30; i++) {
    await userService.save({
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      password: password,
      is_ambassador: true,
    });
    console.log('Creating seed ambassadors');
  }
  process.exit();
})();
