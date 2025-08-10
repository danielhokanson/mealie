# Development Environment Setup

!!! warning
Be sure to use the [Nightly version](https://nightly.mealie.io/) of the docs to ensure you're up to date with
the latest changes.

This guide covers setting up the development environment for Mealie. The application uses Angular for the frontend and .NET Core for the backend API.

!!! note "Architecture"
Mealie has evolved from a Vue.js/Python architecture to the current Angular/.NET Core implementation for improved performance and maintainability.

## Prerequisites

### Required Software

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0) or later
- [Node.js 20.x](https://nodejs.org/en/) or later
- [Angular CLI](https://angular.io/cli) - Install with `npm install -g @angular/cli`
- [Docker](https://www.docker.com/) - For PostgreSQL and other services
- [Git](https://git-scm.com/)

### Optional but Recommended

- [Visual Studio Code](https://code.visualstudio.com/) with extensions:
  - C# Dev Kit
  - Angular Language Service
  - Docker
- [pgAdmin](https://www.pgadmin.org/) - PostgreSQL administration tool

## Project Structure

```
mealie/
├── mealie-angular/          # Angular frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/        # Core services and guards
│   │   │   ├── shared/      # Shared components and utilities
│   │   │   └── modules/     # Feature modules
│   │   └── environments/    # Environment configurations
│   ├── package.json
│   └── angular.json
├── MealieApi/              # .NET Core backend solution
│   ├── MealieApi.sln       # Solution file
│   └── src/
│       ├── MealieApi.Domain/        # Domain entities and interfaces
│       ├── MealieApi.Application/   # Business logic and services
│       ├── MealieApi.Infrastructure/ # Data access and external services
│       ├── MealieApi.WebApi/        # API controllers and configuration
│       └── MealieApi.Shared/        # DTOs and shared models
└── docker/                 # Docker configurations
    ├── docker-compose.dev.yml
    └── scripts/
```

## Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/mealie.git
cd mealie
```

### 2. Start Development Services

Start PostgreSQL and other required services:

```bash
cd docker
./scripts/start-dev.sh
```

This will start:

- PostgreSQL on port 5432
- Separate containers for frontend and backend development

### 3. Backend Setup (.NET Core)

Navigate to the backend directory and restore dependencies:

```bash
cd MealieApi
dotnet restore
```

Set up your development environment variables by creating `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=mealie_dev;Username=mealie_dev;Password=dev_password"
  },
  "JWT": {
    "SecretKey": "development-jwt-key-not-for-production-use-something-longer",
    "Issuer": "MealieApi",
    "Audience": "MealieAngular",
    "ExpirationMinutes": 60
  },
  "CORS": {
    "AllowedOrigins": ["http://localhost:4200", "http://localhost:3000"]
  },
  "AllowSignup": true,
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

Run database migrations:

```bash
cd src/MealieApi.WebApi
dotnet ef database update
```

Start the backend API:

```bash
dotnet run
```

The API will be available at `http://localhost:5000`

### 4. Frontend Setup (Angular)

In a new terminal, navigate to the frontend directory:

```bash
cd mealie-angular
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
ng serve
```

The Angular application will be available at `http://localhost:4200`

## Development Workflow

### Backend Development

#### Running Tests

```bash
cd MealieApi
dotnet test
```

#### Database Migrations

Create a new migration:

```bash
cd src/MealieApi.Infrastructure
dotnet ef migrations add YourMigrationName --startup-project ../MealieApi.WebApi
```

Apply migrations:

```bash
cd src/MealieApi.WebApi
dotnet ef database update
```

#### API Documentation

The API documentation is automatically generated and available at:

- Swagger UI: `http://localhost:5000/swagger`
- OpenAPI JSON: `http://localhost:5000/swagger/v1/swagger.json`

### Frontend Development

#### Running Tests

```bash
cd mealie-angular
npm run test
```

#### Building for Production

```bash
ng build --configuration production
```

#### Linting

```bash
ng lint
```

### Code Style and Formatting

#### Backend (.NET)

The project uses standard .NET formatting. Use your IDE's formatting features or:

```bash
dotnet format
```

#### Frontend (Angular)

The project uses Prettier and ESLint:

```bash
npm run format
npm run lint
```

## Architecture Overview

### Backend Architecture

The .NET backend follows Clean Architecture principles:

- **Domain Layer**: Entities, value objects, and domain services
- **Application Layer**: Use cases, interfaces, and business logic
- **Infrastructure Layer**: Data access, external services, and frameworks
- **WebApi Layer**: Controllers, middleware, and API configuration

Key technologies:

- ASP.NET Core Web API
- Entity Framework Core
- AutoMapper
- JWT Authentication
- PostgreSQL

### Frontend Architecture

The Angular frontend follows Angular best practices:

- **Core Module**: Singleton services and guards
- **Shared Module**: Reusable components and utilities
- **Feature Modules**: Lazy-loaded feature-specific modules
- **Services**: HTTP clients and state management

Key technologies:

- Angular 17+
- Angular Material
- RxJS
- TypeScript
- Progressive Web App (PWA) features

## Debugging

### Backend Debugging

Use Visual Studio Code or Visual Studio:

1. Set breakpoints in your code
2. Press F5 or use "Run and Debug"
3. The debugger will attach to the running process

### Frontend Debugging

Use browser developer tools:

1. Open Chrome/Firefox developer tools
2. Use the Sources tab to set breakpoints
3. Use the Angular DevTools extension for component inspection

## Common Issues

### CORS Issues

If you encounter CORS issues, ensure your `appsettings.Development.json` includes the correct origins:

```json
{
  "CORS": {
    "AllowedOrigins": ["http://localhost:4200"]
  }
}
```

### Database Connection Issues

Ensure PostgreSQL is running and the connection string is correct:

```bash
docker-compose -f docker-compose.dev.yml ps postgres
```

### Port Conflicts

If ports 4200 or 5000 are in use, you can change them:

```bash
# Angular - different port
ng serve --port 4201

# .NET - different port (update appsettings.json)
dotnet run --urls "http://localhost:5001"
```

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Ensure tests pass
4. Run linting and formatting
5. Create a pull request

See the [Code Contributions Guide](./code-contributions.md) for more details.

## Hot Reload

Both the Angular frontend and .NET backend support hot reload during development:

- **Angular**: Automatically reloads on file changes
- **.NET**: Use `dotnet watch run` for automatic restarts

## Environment Variables

For development, you can use these environment variables:

```bash
export ASPNETCORE_ENVIRONMENT=Development
export ConnectionStrings__DefaultConnection="Host=localhost;Database=mealie_dev;Username=mealie_dev;Password=dev_password"
export JWT__SecretKey="development-key-change-in-production"
```

## Next Steps

- Read the [Code Contributions Guide](./code-contributions.md)
- Check out the [API Documentation](../../getting-started/api-usage.md)
- Join the [Discord community](https://discord.gg/QuStdQGSGK)
