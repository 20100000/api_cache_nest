import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';

@Injectable()
export class ClientService {
  private readonly cacheKey = 'clients:list';

  constructor(
    @InjectModel(Client)
    private clientModel: typeof Client,
    
    @Inject(CACHE_MANAGER) 
    private cacheManager: Cache,
  ) {}

  // 💡 CREATE: Salva no Postgres e faz um PUSH (adiciona) na lista existente do Redis
  async create(createClientDto: CreateClientDto): Promise<Client> {
    const client = await this.clientModel.create({ ...createClientDto });
    const clientRaw = client.get({ plain: true });

    let cachedList = await this.cacheManager.get<any[]>(this.cacheKey);
    
    if (!cachedList) {
      cachedList = await this.clientModel.findAll({ raw: true });
    } else {
      cachedList.push(clientRaw);
    }

    await this.cacheManager.set(this.cacheKey, cachedList, 60000);
    console.log(`📥 [Redis] PUSH: Cliente ID ${clientRaw.id} adicionado na lista do Cache.`);

    return client;
  }

  // 💡 GET ALL: Busca SEMPRE direto no PostgreSQL (Corrigido para a sua regra)
  async findAll(): Promise<Client[]> {
    console.log('🗄️ [PostgreSQL] Buscando todos os clientes direto no Banco...');
    return this.clientModel.findAll({ raw: true });
  }

  // 💡 GET BY ID: Busca primeiro no Array em Cache do Redis. Se não achar, vai no banco.
  async findOne(id: number): Promise<Client> {
    const cachedList = await this.cacheManager.get<any[]>(this.cacheKey);
    console.log(`⚡ [FIRST REDIS -> ]  ${cachedList} `);

    if (cachedList) {
      const client = cachedList.find(c => c.id === id);
      if (client) {
        console.log(`⚡ [Redis] Cliente ID ${id} encontrado dentro do Array em Cache!`);
        return client;
      }
    }

    console.log(`🗄️ [PostgreSQL] Cache Miss! Buscando cliente ID ${id} direto no Banco...`);
    const client = await this.clientModel.findByPk(id, { raw: true });
    if (!client) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado.`);
    }
    
    // Alimenta a lista do Redis caso ela estivesse vazia
    if (!cachedList) {
      const allClients = await this.clientModel.findAll({ raw: true });
      await this.cacheManager.set(this.cacheKey, allClients, 60000);
    }

    return client;
  }

  // 💡 UPDATE: Atualiza o Postgres e modifica o item específico dentro do Array do Redis
  async update(id: number, updateClientDto: UpdateClientDto): Promise<any> {
    const clientInstance = await this.clientModel.findByPk(id);
    if (!clientInstance) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado.`);
    }

    const updatedClient = await clientInstance.update(updateClientDto);
    const clientRaw = updatedClient.get({ plain: true });

    const cachedList = await this.cacheManager.get<any[]>(this.cacheKey);
    if (cachedList) {
      const index = cachedList.findIndex(c => c.id === id);
      if (index !== -1) {
        cachedList[index] = clientRaw;
        await this.cacheManager.set(this.cacheKey, cachedList, 60000);
        console.log(`🔄 [Redis] UPDATE: Item ID ${id} atualizado dentro do Array em Cache.`);
      }
    }

    return clientRaw;
  }

  // 💡 REMOVE: Deleta do Postgres e remove o item do Array do Redis
  async remove(id: number): Promise<void> {
    const clientInstance = await this.clientModel.findByPk(id);
    if (!clientInstance) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado.`);
    }

    await clientInstance.destroy();

    const cachedList = await this.cacheManager.get<any[]>(this.cacheKey);
    if (cachedList) {
      const updatedList = cachedList.filter(c => c.id !== id);
      await this.cacheManager.set(this.cacheKey, updatedList, 60000);
      console.log(`🧹 [Redis] REMOVE: Item ID ${id} removido do Array em Cache.`);
    }
  }
}
