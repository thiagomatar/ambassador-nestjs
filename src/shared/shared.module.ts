import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import type { RedisClientOptions } from 'redis';
import { redisStore } from 'cache-manager-redis-yet';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.register({
      secret: 'secret',
      signOptions: {
        expiresIn: '1d',
      },
    }),
    CacheModule.registerAsync<RedisClientOptions>({
      imports: [ConfigModule],
      useFactory: async (cfg: ConfigService) => ({
        store: await redisStore({
          socket: {
            // host: cfg.get('REDIS_HOST'),
            // port: parseInt(cgf.get('REDIS_PORT ') || '6379'),
            // password: cfg.get('REDIS_PASSWORD'),
            // ttl: cfg.get('REDIS_TTL'),
            host: 'localhost',
            port: 6379,
          },
        }),
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [JwtModule, CacheModule],
})
export class SharedModule { }
