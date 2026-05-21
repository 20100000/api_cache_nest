import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { ClientModule } from './client/client.module';
import { Client } from './client/entities/client.entity';
import { DatabaseSeedService } from './database-seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const store = await redisStore({
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT) || 6379,
          },
        });
        
        return {
          store: store as any,
          ttl: 60 * 1000, // Tempo de cache padrão global em milissegundos (60s)
        };
      },
    }),

    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      autoLoadModels: true,
      synchronize: true,
      //sync: { force: true },
    }),
    SequelizeModule.forFeature([Client]),
    ClientModule,
  ],
  providers: [DatabaseSeedService],
})
export class AppModule {}
