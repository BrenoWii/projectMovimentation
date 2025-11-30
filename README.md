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
