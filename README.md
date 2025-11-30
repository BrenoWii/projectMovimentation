<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[travis-image]: https://api.travis-ci.org/nestjs/nest.svg?branch=master
[travis-url]: https://travis-ci.org/nestjs/nest
[linux-image]: https://img.shields.io/travis/nestjs/nest/master.svg?label=linux
[linux-url]: https://travis-ci.org/nestjs/nest
  
  <p align="center">A progressive <a href="http://nodejs.org" target="blank">Node.js</a> framework for building efficient and scalable server-side applications, heavily inspired by <a href="https://angular.io" target="blank">Angular</a>.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/dm/@nestjs/core.svg" alt="NPM Downloads" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://api.travis-ci.org/nestjs/nest.svg?branch=master" alt="Travis" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://img.shields.io/travis/nestjs/nest/master.svg?label=linux" alt="Linux" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#5" alt="Coverage" /></a>
<a href="https://gitter.im/nestjs/nestjs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=body_badge"><img src="https://badges.gitter.im/nestjs/nestjs.svg" alt="Gitter" /></a>
<a href="https://opencollective.com/nest#backer"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec"><img src="https://img.shields.io/badge/Donate-PayPal-dc3d53.svg"/></a>
  <a href="https://twitter.com/nestframework"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

Financial movements management API built with [NestJS](https://github.com/nestjs/nest) and TypeScript.

## Swagger Documentation

After starting the application, access the interactive documentation:

**URL:** [http://localhost:3000/api](http://localhost:3000/api)

## Installation

```bash
$ yarn install
```

## Configuration

1. Copy `.env.example` file to `.env`
2. Configure environment variables (PostgreSQL database)
3. Run necessary migrations

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production
$ yarn start:prod
```

## 🐳 Running with Docker (Recommended)

### Quick Start

```powershell
# Start everything (Backend + Database + Frontend)
.\start-all.ps1

# Stop everything
.\stop-all.ps1
```

### 📦 What's Included

- **PostgreSQL 15**: Database on port 5432
- **NestJS Backend**: API on port 3000
- **Quasar Frontend**: UI on port 8080
- **Auto-restart**: Containers restart automatically

### 🔒 Database Backup & Security

**⚠️ IMPORTANT: Always backup before:**
- Executing `docker-compose down -v`
- Updating PostgreSQL version
- Making schema changes
- Cleaning Docker volumes

```powershell
# Create backup
.\backup-database.ps1

# List and restore backups
.\restore-database.ps1

# Clean volumes (DANGEROUS - makes backup first!)
.\clean-volumes.ps1
```

📖 **Full backup documentation:** [BACKUP-README.md](./BACKUP-README.md)

### ⚠️ Dangerous Commands

```powershell
# ❌ NEVER run this without backup - DELETES ALL DATA!
docker-compose down -v

# ✅ Safe restart (keeps data)
docker-compose restart
docker-compose down
docker-compose up -d
```

### 🌐 Network Access

The application is configured for local network access (Tailscale):
- **Backend**: `http://localhost:3000` or `http://100.113.154.3:3000`
- **Frontend**: `http://localhost:8080` or `http://100.113.154.3:8080`
- **Swagger**: `http://localhost:3000/api`

## Available Routes

### Authentication (`/api/auth`)
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get logged user (requires authentication)

### Users (`/api/users`)
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user

### Classifications (`/api/classification`)
- `GET /api/classification` - List classifications (with relations)
- `POST /api/classification` - Create classification
  - Required fields: `type`, `planOfBillId`
  - Optional field: `description`

### Plan of Bills (`/api/plan-of-bills`)
- `GET /api/plan-of-bills` - List plan of bills
- `POST /api/plan-of-bills` - Create plan of bills

### Movimentations (`/api/movimentations`) 🔒
*All routes require authentication (Bearer Token)*

- `GET /api/movimentations` - List movimentations (with optional filters)
  - Query params: `dateFrom`, `dateTo`, `payDateFrom`, `payDateTo`, `valueMin`, `valueMax`, `classificationId`
- `GET /api/movimentations/:id` - Get movimentation by ID
- `POST /api/movimentations` - Create movimentation
- `PATCH /api/movimentations/:id` - Update movimentation (partial)

### Import (`/api/import`) 🔒
*All routes require authentication (Bearer Token)*

- `POST /api/import/analyze` - Analyze CSV extract and suggest classifications
  - Body: `{ csvContent: string }`
  - Returns analyzed rows with classification suggestions and confidence levels
- `POST /api/import/bulk` - Bulk create movimentations
  - Body: `{ movimentations: BulkMovimentationItemDto[] }`
  - Creates multiple movimentations at once and optionally learns mappings

### Description Mappings (`/api/mappings`) 🔒
*All routes require authentication (Bearer Token)*

- `GET /api/mappings` - List all learned mappings
- `POST /api/mappings` - Create/update mapping
  - Body: `{ extractDescription: string, classificationId: number }`
- `PUT /api/mappings/:id` - Update mapping
- `DELETE /api/mappings/:id` - Delete mapping

## Entity Models

### User
```typescript
{
  id: number;
  username: string;
  email: string;
  password: string; // hash
  createDate: Date;
  updateDate: Date;
}
```

### Classification
```typescript
{
  id: number;
  description: string;
  type: string;
  planOfBill: PlanOfBills; // ManyToOne relation
  movimentations: Movimentation[]; // OneToMany relation
  createDate: Date;
  updateDate: Date;
}
```

### PlanOfBills
```typescript
{
  id: number;
  description: string;
  classifications: Classification[]; // OneToMany relation
  createDate: Date;
  updateDate: Date;
}
```

### Movimentation
```typescript
{
  id: number;
  date: Date; // movimentation date
  value: number; // value in cents (e.g.: 15000 = $150.00)
  classification: Classification; // ManyToOne relation
  payDate?: Date; // payment date (optional)
  paymentMethod?: PaymentMethod; // payment method (optional)
  user: User; // OneToOne relation
}
```

### PaymentMethod (Enum)
```typescript
enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PIX = 'PIX',
  MONEY = 'MONEY',
  TED = 'TED'
}
```

### DescriptionMapping
```typescript
{
  id: number;
  extractDescription: string; // original description from extract
  normalizedDescription: string; // normalized for matching
  classification: Classification; // ManyToOne relation
  classificationId: number;
  user: User; // ManyToOne relation
  userId: number;
  createDate: Date;
  updateDate: Date;
}
```

## Import System

The import system allows you to:

1. **Upload bank extracts (CSV)** - Supports Nubank format and custom formats
2. **Automatic classification suggestion** - Based on learned mappings
3. **Smart matching** - Uses normalized text comparison and word matching
4. **Bulk import** - Create multiple movimentations at once
5. **Learn from entries** - Save mappings for future imports

### Workflow

1. **Analyze Extract**: Send CSV to `/api/import/analyze`
   - Returns rows with suggested classifications
   - Confidence levels: `high`, `medium`, `low`, `none`
   
2. **Review & Adjust**: Frontend displays suggestions
   - User confirms or changes classifications
   - User can map new descriptions
   
3. **Bulk Create**: Send confirmed data to `/api/import/bulk`
   - Creates all movimentations
   - Optionally saves new mappings (when `learnMapping: true`)

### CSV Format Support

**Nubank Format:**
```csv
Data,Valor,Identificador,Descrição
04/11/2025,2022.34,abc123,Transferência recebida pelo Pix
```

**Generic Format:**
```csv
date,value,description
2025-11-04,2022.34,Transferência recebida pelo Pix
```

## Important Details

### Monetary Values
- Values are stored in **cents** (integer)
- When sending: send in reais/dollars (e.g.: `150` for $150.00)
- Backend automatically converts to cents (`15000`)
- When receiving: divide by 100 to display in reais/dollars

### Dates
- Accepts formats: `YYYY-MM-DD` or full ISO (`YYYY-MM-DDTHH:MM:SSZ`)
- Backend normalizes to local date (no timezone shift)
- Stored as `date` type in PostgreSQL

### Authentication
- Use JWT Bearer Token in header: `Authorization: Bearer <token>`
- Token obtained via `/api/auth/login`

## Tests

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

## Technologies

- NestJS 7.x
- TypeScript
- TypeORM
- PostgreSQL
- JWT Authentication
- class-validator
- class-transformer
- Swagger/OpenAPI

## Author

Breno Oliveira

## License

[MIT licensed](LICENSE)
