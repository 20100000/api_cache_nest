"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const client_entity_1 = require("./entities/client.entity");
let ClientService = class ClientService {
    clientModel;
    constructor(clientModel) {
        this.clientModel = clientModel;
    }
    async onApplicationBootstrap() {
        await this.seedClients();
    }
    async seedClients() {
        const count = await this.clientModel.count();
        if (count === 0) {
            console.log('🌱 Semeando dados iniciais de clientes...');
            await this.clientModel.bulkCreate([
                {
                    name: 'João Silva',
                    email: 'joao.silva@email.com',
                    phone: '11999999999',
                },
                {
                    name: 'Maria Oliveira',
                    email: 'maria.oliveira@email.com',
                    phone: '21988888888',
                },
            ]);
            console.log('✅ 2 Clientes semeados com sucesso!');
        }
    }
    async create(createClientDto) {
        return this.clientModel.create({ ...createClientDto });
    }
    async findAll() {
        return this.clientModel.findAll();
    }
    async findOne(id) {
        const client = await this.clientModel.findByPk(id);
        if (!client) {
            throw new common_1.NotFoundException(`Cliente com ID ${id} não encontrado.`);
        }
        return client;
    }
    async update(id, updateClientDto) {
        const client = await this.findOne(id);
        return client.update(updateClientDto);
    }
    async remove(id) {
        const client = await this.findOne(id);
        await client.destroy();
    }
};
exports.ClientService = ClientService;
exports.ClientService = ClientService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(client_entity_1.Client)),
    __metadata("design:paramtypes", [Object])
], ClientService);
//# sourceMappingURL=client.service.js.map