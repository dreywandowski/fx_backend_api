Naming Conventions
The following conventions will be used:
• Database Collections: We will use lowercase, plural form (e.g., users, profiles).

• Table Columns: We will use snake_case_plural (e.g., `users`, `transactions`).

• API Endpoints: We will use kebab-case and resource-oriented REST paths (e.g., /api/auth/login).

• Environment Variables: Use uppercase with underscores (e.g., JWT_SECRET, MONGO_URI).

• Variable Names: We will use camelCase for variables, function names , object properties and PascalCase for classes and interface

• Modules: Each domain (e.g., `user`, `auth`, `payment`) should have its own folder inside `modules/`.

• DTOs: Request and response objects should be explicitly defined under `dto/` with `*.dto.ts` suffix.

• Entities: Database models should be inside `entities/` and named after the table (e.g., `user.entity.ts`).

• Services & Controllers: Named based on their domain (e.g., `user.service.ts`, `user.controller.ts`).

• Configuration files: configuration files should have `.config.jd/.ts` suffix (`database.config.ts`).

• Environment files: Environment files should follow `.env.[environment]` (`.env.production`).

Coding Standards

- Follow **SOLID Principles**.
- Keep functions small and single-responsibility.
- Use **async/await** instead of Promises.
- Define **interfaces** for structured data.
- Prefer dependency injection over hardcoded dependencies.
- Use TypeScript for strict typing.

**Example:**

```typescript
class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUserById(userId: string): Promise<User> {
    return this.userRepository.findById(userId);
  }
}
```

Security Practices

- **Use environment variables** for secrets (`process.env.JWT_SECRET`).
- **Hash passwords** before storing (`bcrypt`, `argon2`).
- **Implement rate limiting** to prevent abuse.
- **Validate and sanitize inputs** to prevent SQL Injection and XSS.
- **Use HTTPS** and enforce secure headers (`helmet.js`).
- **Implement authentication & authorization** (JWT, OAuth, RBAC).

API Development Guidelines

- Use **RESTful principles** or **GraphQL** based on the use case.
- Follow consistent **HTTP methods** (`GET`, `POST`, `PUT`, `DELETE`).
- Use **standard status codes** (`200 OK`, `400 Bad Request`, `500 Internal Server Error`).
- Implement **pagination and filtering** for large datasets.
- Version APIs (`/api/v1/users`).

Example Response Structure:

```json
{
  "status": "success",
  "data": { "id": 1, "name": "John Doe" }
}
```

Logging and Monitoring

- Use **structured logging** (`winston`, `pino`).
- Store logs in **centralized systems** (ELK stack, CloudWatch).
- Implement **error tracking** (Sentry, Datadog).
- Use **health checks** for monitoring (`/health`).

Testing and CI/CD

- Write **unit tests** for critical logic (`jest`, `mocha`).
- Use **integration tests** to validate API endpoints.
- Automate tests in **CI/CD pipelines** (`GitHub Actions`, `Jenkins`).
- Enforce **code reviews** before merging PRs.

Documentation

- Maintain a **README.md** with setup instructions.
- Use **Swagger** for API documentation (`@nestjs/swagger`).
- Include **architecture diagrams** and **ERDs** for databases.
- Keep documentation **updated** as features change.

Performance Optimization

- **Use caching** (`Redis`, `Memcached`) for frequent queries.
- **Optimize database queries** (`indexes`, `query optimization`).
- **Avoid memory leaks** (`node --inspect`, `heap snapshots`).
- **Use background jobs** for long-running tasks (`BullMQ`).
- **Minimize API response sizes** (compression, selective field returns).

Enterprise Application Project Structure

This document outlines the best practices for structuring a large-scale enterprise application.

Project Folder Structure

/aishtar

│── src/

│ │── modules/

│ │ │── user/

│ │ │ │── controllers/

│ │ │ │ ├── user.controller.ts

│ │ │ │── services/

│ │ │ │ ├── user.service.ts

│ │ │ │── repositories/

│ │ │ │ ├── user.repository.ts

│ │ │ │── dto/

│ │ │ │ ├── create-user.dto.ts

│ │ │ │ ├── update-user.dto.ts

│ │ │ │── entities/

│ │ │ │ ├── user.entity.ts

│ │ │ │── user.module.ts

│ │── config/

│ │ ├── database.config.ts

│ │ ├── app.config.ts

│ │── common/

│ │ ├── decorators/

│ │ ├── filters/

│ │ ├── guards/

│ │ ├── interceptors/

│ │── middlewares/

│ │── utils/

│ │── main.ts

│── test/

│── .env

│── .gitignore

│── README.md

│── package.json

│── tsconfig.json

│── nest-cli.json

### **Description**

- **`src/modules/`** → Contains feature-specific modules (e.g., `user`, `auth`).
- **`controllers/`** → Handles HTTP requests and responses.
- **`services/`** → Implements business logic.
- **`repositories/`** → Manages database interactions.
- **`dto/`** → Defines request/response object structures.
- **`entities/`** → Defines database models.
- **`config/`** → Stores application configurations.
- **`common/`** → Houses shared utilities like decorators, filters, guards.
- **`middlewares/`** → Stores application middlewares.
- **`utils/`** → Helper functions for logging, transformations, etc.
- **`test/`** → Contains unit and integration tests.
- **`docs/`** → Stores API documentation and architectural diagrams.
- **`.env`** → Stores environment variables.
- **`.gitignore`** → Specifies files to exclude from version control.
- **`README.md`** → Provides documentation for the project.
- **`package.json`** → Lists dependencies and scripts.
- **`tsconfig.json`** → Configures TypeScript.
- **`nest-cli.json`** → Configures NestJS CLI.

Local Deployment

- Clone the repository and cd to it.
- Ensure env values are set.

$ npm install

$ npm run start

# watch mode

$ npm run start:dev

# production mode

$ npm run start:prod
