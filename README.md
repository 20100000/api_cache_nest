# 🚀 NestJS Core API - Postgres & Redis Cache

Uma API REST de alta performance desenvolvida com **NestJS** e **Node.js**, utilizando **Sequelize ORM** para persistência de dados no **PostgreSQL** e uma estratégia avançada de cache em memória utilizando **Redis**.

O projeto conta com documentação interativa automatizada e ambiente totalmente conteinerizado com **Docker** e **Docker Compose**.

## 📋 Sobre o Projeto e Estratégia de Cache

O projeto consiste no gerenciamento de um CRUD de **Clientes (Clients)**, otimizado para lidar com grande volume de requisições de forma inteligente através de duas abordagens de banco de dados:

1. **Escrita e Atualização reativas (Cache-Aside / Write-Through Híbrido):** Sempre que um cliente é criado (`POST`), atualizado (`PATCH`) ou removido (`DELETE`), a alteração é feita imediatamente no PostgreSQL. Ao mesmo tempo, o NestJS atualiza um **Array unificado de cache** (`clients:list`) dentro da memória RAM do Redis usando operações estilo *Push* ou mapeamento.
2. **Listagem Geral (`GET /client`):** Visando dados 100% consistentes e em tempo real, a rota de listagem geral busca as informações **sempre direto do PostgreSQL**.
3. **Leitura por ID (`GET /client/:id`):** Busca **primeiro na memória do Redis**. Se o cliente for encontrado no array em cache, a API responde instantaneamente (Performance Máxima). Caso ocorra um *Cache Miss* (não encontrado), ela recorre ao PostgreSQL.

---

## 🛠️ Tecnologias Utilizadas

* **Framework Principal:** [NestJS (v10)](https://nestjs.com)
* **Linguagem:** TypeScript
* **Runtime:** Node.js (v20 Alpine)
* **ORM (Banco Relacional):** Sequelize & Sequelize-TypeScript
* **Banco de Dados Principal:** PostgreSQL 15
* **Banco de Dados de Cache:** Redis 7
* **Gerenciador de Cache:** `@nestjs/cache-manager` & `cache-manager` (v5)
* **Documentação:** Swagger UI / OpenAPI
* **Ambiente Virtual:** Docker & Docker Compose

---

## 👨‍💻 Desenvolvedor

* **Nome:** [Seu Nome Aqui]
* **E-mail:** [Seu E-mail Aqui]

---

## 🚀 Como Clonar e Iniciar o Projeto

### Pré-requisitos
Você precisa ter instalado em sua máquina:
* [Git](https://git-scm.com)
* [Docker](https://docker.com) e **Docker Compose**

### 1. Clonar o Repositório
Abra o seu terminal e execute:
```bash
git clone https://github.com
cd nome-do-seu-repositorio
```

### 2. Configurar as Variáveis de Ambiente
O Docker Compose já possui as credenciais embutidas para desenvolvimento, mas garanta que possui um arquivo `.env` na raiz com a seguinte estrutura para o NestJS mapear as conexões locais:
```env
DB_HOST=postgres
DB_PORT=5432
DB_USER=tiago
DB_PASS=tiago@123
DB_NAME=nest_api
PORT=3000
REDIS_HOST=redis
REDIS_PORT=6379
```

### 3. Iniciar a Aplicação (Sem Cache de Build)
Para baixar as imagens do Postgres e Redis, instalar as dependências e compilar o TypeScript do NestJS do zero absolute, execute:
```bash
docker builder prune -f && docker-compose up --build
```
Após o carregamento, a aplicação estará disponível em `http://localhost:3000`.

---

## 🌐 Como Testar com o Swagger UI

A API possui documentação visual e interativa integrada. Com os containers rodando, abra o seu navegador e acesse:

👉 **[http://localhost:3000/api](http://localhost:3000/api)**

### Fluxo de Teste Recomendado:
1. Abra a rota **`GET /client`**, clique em *"Try it out"* e depois em *"Execute"*. Você verá os dados iniciais gerados automaticamente pelo sistema de sementes (`DatabaseSeedService`).
2. Utilize a rota **`POST /client`** para cadastrar um novo cliente fornecendo `name`, `email` (único) e `phone`.
3. Utilize o ID gerado (Auto-incremento: 1, 2, 3...) para fazer buscas específicas na rota **`GET /client/{id}`**.

---

## 📊 Como Analisar os Logs de Cache vs Banco

Para acompanhar o comportamento inteligente do cache e a economia de processamento do banco relacional, observe os logs gerados no terminal do Docker onde o comando `docker-compose up` está sendo executado:

### 🗄️ Cenário 1: Consulta ao PostgreSQL
Ao chamar a rota **`GET /client`** (Listagem Geral) ou ao buscar um ID inexistente no Redis, você verá o log de consulta ao banco físico:
```text
🗄️ [PostgreSQL] Buscando todos os clientes direto no Banco...
Executing (default): SELECT "id", "name", "email", "phone" FROM "clients" AS "Client";
```

### ⚡ Cenário 2: Resposta Instantânea do Redis Cache
Ao chamar a rota **`GET /client/{id}`** (Buscar por ID) de um cliente recentemente criado ou já consultado, a API não tocará no Postgres, respondendo diretamente da memória RAM:
```text
⚡ [Redis] Cliente ID 1 encontrado dentro do Array em Cache!
```

### 📥 Cenário 3: Atualização de Estado (Push / Mutações)
Ao cadastrar ou atualizar um usuário, você verá a sincronização em lote acontecer no cache em tempo real:
```text
📥 [Redis] PUSH: Cliente ID 3 adicionado na lista do Cache.
🔄 [Redis] UPDATE: Item ID 3 atualizado dentro do Array em Cache.
```

### 🧹 Verificando os itens salvos dentro do Redis manualmente
Se você quiser auditar as chaves em memória viva dentro do container do Redis, abra uma nova janela de terminal e digite:
```bash
# 1. Entrar no terminal do Redis
docker exec -it nest_redis_cache redis-cli

# 2. Listar a chave centralizada do Array de Cache
keys *
# Saída esperada: 1) "clients:list"

# 3. Ler o JSON puro armazenado dentro da chave
get clients:list

# 4. Sair do terminal do Redis

### 🧹 Verificando os itens salvos dentro do Redis facilmente

Para auditar as chaves em memória viva sem precisar digitar comandos longos do Docker, execute no seu terminal local:

```bash
# 1. Entrar no CLI do Redis via atalho NPM
npm run redis:cli

# 2. Listar as chaves ativas
keys *

# 3. Ler o JSON puro armazenado dentro da lista de cache
get clients:list

# 4. Sair do terminal
exit
```

Dessa forma, o gerenciamento do seu ecossistema ficou muito mais ágil! Gostaria de avançar agora para as **validações automáticas de dados** (`class-validator`) nos DTOs ou quer criar uma nova tabela relacionada ao cliente?

exit
```
