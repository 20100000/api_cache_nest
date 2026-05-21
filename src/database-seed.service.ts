import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Client } from './client/entities/client.entity';

@Injectable()
export class DatabaseSeedService implements OnApplicationBootstrap {
  constructor(
    @InjectModel(Client)
    private clientModel: typeof Client,
  ) {}

  async onApplicationBootstrap() {
    console.log('🌱 [Seed] Verificando sementes do banco de dados...');
    await this.seedClients();
  }

  private async seedClients() {
    const count = await this.clientModel.count();
    if (count === 0) {
      console.log('🌱 [Seed] Inserindo clientes iniciais no PostgreSQL...');
      await this.clientModel.bulkCreate([
        { name: 'João Silva', email: 'joao@email.com', phone: '11999999999' },
        { name: 'Maria Oliveira', email: 'maria@email.com', phone: '21988888888' },
      ]);
      console.log('✅ [Seed] Clientes semeados com sucesso!');
    } else {
      console.log('✨ [Seed] Clientes já existem no banco. Pulando...');
    }
  }
}
