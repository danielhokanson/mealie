# .NET Backend Configuration

## Environment Variables

The Mealie .NET Core backend uses standard .NET configuration patterns. Configuration can be provided through environment variables, `appsettings.json` files, or command-line arguments.

### General Application Settings

| Variable               |        Default        | Description                                                   |
| ---------------------- | :-------------------: | ------------------------------------------------------------- |
| ASPNETCORE_ENVIRONMENT |      Production       | .NET Core environment (Development, Staging, Production)      |
| ASPNETCORE_URLS        | http://127.0.0.1:5000 | URLs that the .NET Core application listens on                |
| TZ                     |          UTC          | Must be set to get correct date/time on the server            |
| ALLOW_SIGNUP           |         false         | Allow user sign-up without token                              |
| BASE_URL               | http://localhost:9091 | Base URL for the application, used for CORS and notifications |

### JWT Authentication

| Variable                 | Default                                        | Description                                                            |
| ------------------------ | ---------------------------------------------- | ---------------------------------------------------------------------- |
| JWT\_\_SecretKey         | change-this-super-secret-jwt-key-in-production | **REQUIRED:** Secret key for JWT token signing (change in production!) |
| JWT\_\_Issuer            | MealieApi                                      | JWT token issuer                                                       |
| JWT\_\_Audience          | MealieAngular                                  | JWT token audience                                                     |
| JWT\_\_ExpirationMinutes | 60                                             | JWT token expiration time in minutes                                   |

!!! warning "Security"
**Always change the JWT\_\_SecretKey in production!** Use a long, random string (at least 32 characters).

### Database Configuration

| Variable                               | Default                                                                | Description                                            |
| -------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------ |
| ConnectionStrings\_\_DefaultConnection | Host=postgres;Database=mealie;Username=mealie;Password=mealie_password | Entity Framework Core connection string for PostgreSQL |

#### PostgreSQL Connection String Format

The connection string follows the standard Npgsql format:

```
Host=server;Database=database_name;Username=user;Password=password;Port=5432
```

#### Docker Compose Variables

When using Docker Compose, these variables are used to configure the PostgreSQL container:

| Variable          | Default         | Description              |
| ----------------- | --------------- | ------------------------ |
| POSTGRES_DB       | mealie          | PostgreSQL database name |
| POSTGRES_USER     | mealie          | PostgreSQL username      |
| POSTGRES_PASSWORD | mealie_password | PostgreSQL password      |

### CORS Configuration

| Variable               | Default                                     | Description                                  |
| ---------------------- | ------------------------------------------- | -------------------------------------------- |
| CORS\_\_AllowedOrigins | http://localhost:4200,http://localhost:3000 | Comma-separated list of allowed CORS origins |

### Logging

| Variable  | Default     | Description                                                         |
| --------- | ----------- | ------------------------------------------------------------------- |
| LOG_LEVEL | Information | Logging level (Trace, Debug, Information, Warning, Error, Critical) |

The .NET application uses the standard Microsoft logging framework. Logs are output to the console by default.

### Docker Environment Variables

When running in Docker, these additional variables are available:

| Variable | Default | Description                                       |
| -------- | ------- | ------------------------------------------------- |
| PUID     | 911     | UserID permissions between host OS and container  |
| PGID     | 911     | GroupID permissions between host OS and container |

### Security Headers

The application automatically configures security headers including:

- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block

### Health Checks

The application provides health check endpoints:

- `/health` - Basic health check
- `/api/health` - API-specific health check

## Configuration Files

### appsettings.json

You can also configure the application using `appsettings.json` files:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=mealie;Username=mealie;Password=your_password"
  },
  "JWT": {
    "SecretKey": "your-super-secret-jwt-key-change-in-production",
    "Issuer": "MealieApi",
    "Audience": "MealieAngular",
    "ExpirationMinutes": 60
  },
  "CORS": {
    "AllowedOrigins": ["http://localhost:4200", "http://localhost:3000"]
  },
  "AllowSignup": false,
  "BaseUrl": "http://localhost:9091"
}
```

### Environment-Specific Configuration

- `appsettings.Development.json` - Development environment
- `appsettings.Production.json` - Production environment
- `appsettings.Staging.json` - Staging environment

## Docker Secrets

Environment variables support Docker Compose secrets by appending `_FILE` to the variable name:

```yaml
services:
  mealie:
    environment:
      - JWT__SecretKey_FILE=/run/secrets/jwt-secret
      - ConnectionStrings__DefaultConnection_FILE=/run/secrets/db-connection
    secrets:
      - jwt-secret
      - db-connection

secrets:
  jwt-secret:
    file: ./secrets/jwt-secret.txt
  db-connection:
    file: ./secrets/db-connection.txt
```

## Migration from Python Backend

If migrating from the Python backend, note these key differences:

| Python Variable | .NET Variable                          | Notes                                        |
| --------------- | -------------------------------------- | -------------------------------------------- |
| API_PORT        | ASPNETCORE_URLS                        | Use full URL format                          |
| TOKEN_TIME      | JWT\_\_ExpirationMinutes               | Time unit changed from hours to minutes      |
| DB_ENGINE       | ConnectionStrings\_\_DefaultConnection | Use connection string instead of engine type |
| POSTGRES\_\*    | ConnectionStrings\_\_DefaultConnection | Combine into connection string               |

The .NET backend only supports PostgreSQL databases (no SQLite support).
