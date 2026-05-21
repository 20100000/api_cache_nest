import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { Client } from './entities/client.entity';

@Module({
  imports: [SequelizeModule.forFeature([Client])], // Dá acesso ao repositório do banco
  controllers: [ClientController],
  providers: [ClientService],
})
export class ClientModule {}
