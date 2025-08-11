# MealieApi

A .NET 9 Web API for the Mealie recipe management system, now configured to use PostgreSQL 17.

## Database Configuration

This project has been converted from Microsoft SQL Server (MSSQL) to PostgreSQL 17. The following changes were made:

### Package Changes

- Replaced `Microsoft.EntityFrameworkCore.SqlServer` with `Npgsql.EntityFrameworkCore.PostgreSQL`
- Updated Entity Framework Core packages to version 9.0.0 for .NET 9 compatibility

### Configuration Changes

- Updated `DependencyInjection.cs` to use `UseNpgsql()` instead of `UseSqlServer()`
- Updated connection strings in `appsettings.json` and `appsettings.Development.json` to use PostgreSQL format
- Regenerated migrations to use PostgreSQL-compatible data types

### PostgreSQL Connection String Format

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=MealieApi;Username=postgres;Password=postgres;Port=5432"
  }
}
```

## Prerequisites

- .NET 9 SDK
- PostgreSQL 17 (or compatible version)
- Entity Framework Core tools

## Setup Instructions

1. **Install PostgreSQL 17**

   ```bash
   # On Fedora/RHEL/CentOS
   sudo dnf install postgresql postgresql-server postgresql-contrib

   # On Ubuntu/Debian
   sudo apt install postgresql postgresql-contrib
   ```

2. **Initialize PostgreSQL**

   ```bash
   sudo postgresql-setup --initdb
   sudo systemctl enable postgresql
   sudo systemctl start postgresql
   ```

3. **Create Database and User**

   ```bash
   sudo -u postgres psql

   CREATE DATABASE "MealieApi";
   CREATE USER mealie_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE "MealieApi" TO mealie_user;
   \q
   ```

4. **Update Connection String**
   Update the connection string in `appsettings.json` and `appsettings.Development.json` with your actual PostgreSQL credentials.

5. **Apply Migrations**

   ```bash
   cd MealieApi
   dotnet ef database update --project MealieApi.Infrastructure --startup-project MealieApi.WebApi
   ```

6. **Run the Application**
   ```bash
   dotnet run --project MealieApi.WebApi
   ```

## Data Type Mappings

The following data type mappings were applied when converting from MSSQL to PostgreSQL:

| MSSQL              | PostgreSQL                 |
| ------------------ | -------------------------- |
| `uniqueidentifier` | `uuid`                     |
| `nvarchar`         | `character varying`        |
| `nvarchar(max)`    | `text`                     |
| `datetime2`        | `timestamp with time zone` |
| `bit`              | `boolean`                  |
| `int`              | `integer`                  |
| `decimal`          | `numeric`                  |

## Troubleshooting

### Common Issues

1. **Connection Refused**: Ensure PostgreSQL service is running

   ```bash
   sudo systemctl status postgresql
   ```

2. **Authentication Failed**: Check username/password in connection string and PostgreSQL user permissions

3. **Database Not Found**: Ensure the database exists and the user has proper permissions

4. **Migration Errors**: If you encounter migration issues, you may need to remove existing migrations and regenerate them:
   ```bash
   dotnet ef migrations remove --project MealieApi.Infrastructure --startup-project MealieApi.WebApi
   dotnet ef migrations add InitialCreate --project MealieApi.Infrastructure --startup-project MealieApi.WebApi
   ```

### Performance Considerations

- PostgreSQL 17 includes performance improvements for JSON operations
- Consider using connection pooling for production deployments
- Monitor query performance using PostgreSQL's built-in query analyzer

## Development

To add new migrations after making model changes:

```bash
dotnet ef migrations add MigrationName --project MealieApi.Infrastructure --startup-project MealieApi.WebApi
dotnet ef database update --project MealieApi.Infrastructure --startup-project MealieApi.WebApi
```

## Production Deployment

For production deployments:

1. Use environment-specific connection strings
2. Implement proper connection pooling
3. Use SSL connections for security
4. Consider using connection string builders for dynamic configuration
5. Implement proper backup and recovery procedures for PostgreSQL

