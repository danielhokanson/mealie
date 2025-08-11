# Database Setup Script Usage

## Overview

The `setup-database.sh` script automates the PostgreSQL database setup process for the MealieApi project. It handles reading configuration, dropping existing databases, and running Entity Framework migrations.

## Prerequisites

1. **PostgreSQL 17** installed and running
2. **PostgreSQL client tools** (psql) available in PATH
3. **.NET 9 SDK** installed
4. **Entity Framework tools** available (`dotnet ef`)

## Usage

### Basic Usage

```bash
# Navigate to the MealieApi solution directory
cd MealieApi

# Run the setup script
./setup-database.sh
```

### What the Script Does

1. **Configuration Reading**:

   - First tries to read from `appsettings.Development.json`
   - Falls back to `appsettings.json` if development config not found
   - Extracts the `DefaultConnection` connection string

2. **Database Management**:

   - Checks if the target database exists
   - Drops the database if it exists (terminating all connections first)
   - Creates a fresh database

3. **EF Migrations**:
   - Runs `dotnet ef database update` to apply all migrations
   - Uses the connection string from the configuration file

### Configuration Files

The script expects these configuration files in `MealieApi.WebApi/`:

#### appsettings.Development.json (preferred)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=MealieApi;Username=postgres;Password=postgres;Port=5432"
  }
}
```

#### appsettings.json (fallback)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=MealieApi;Username=postgres;Password=postgres;Port=5432"
  }
}
```

## Script Features

### Error Handling

- Exits on any error (`set -e`)
- Provides clear error messages
- Checks prerequisites before execution

### Colored Output

- **Blue**: Information messages
- **Green**: Success messages
- **Yellow**: Warning messages
- **Red**: Error messages

### Connection String Parsing

- Automatically extracts host, port, database, username, and password
- Sets sensible defaults for missing values
- Supports both `jq` (if available) and fallback parsing methods

### Database Safety

- Terminates all active connections before dropping database
- Uses proper PostgreSQL quoting for database names
- Handles password authentication securely

## Troubleshooting

### Common Issues

1. **Permission Denied**

   ```bash
   chmod +x setup-database.sh
   ```

2. **PostgreSQL Not Running**

   ```bash
   sudo systemctl start postgresql
   sudo systemctl status postgresql
   ```

3. **psql Not Found**

   ```bash
   # Install PostgreSQL client tools
   sudo dnf install postgresql  # Fedora/RHEL
   sudo apt install postgresql-client  # Ubuntu/Debian
   ```

4. **Connection Failed**

   - Check PostgreSQL is running
   - Verify username/password in connection string
   - Ensure PostgreSQL accepts connections from localhost

5. **EF Tools Not Found**
   ```bash
   dotnet tool install --global dotnet-ef
   ```

### Verbose Output

The script runs EF migrations with `--verbose` flag for detailed output. If you need more debugging:

```bash
# Check script execution
bash -x ./setup-database.sh

# Check EF tools version
dotnet ef --version
```

## Manual Steps (Alternative)

If you prefer to run the steps manually:

```bash
# 1. Read connection string from config
# 2. Drop database (if exists)
psql -h localhost -U postgres -c "DROP DATABASE IF EXISTS \"MealieApi\";"

# 3. Create database
psql -h localhost -U postgres -c "CREATE DATABASE \"MealieApi\";"

# 4. Run EF migrations
dotnet ef database update --project MealieApi.Infrastructure --startup-project MealieApi.WebApi
```

## Security Notes

- The script temporarily sets `PGPASSWORD` environment variable
- Passwords are cleared after each database operation
- Connection strings should not contain sensitive data in development
- Use environment variables or user secrets for production passwords

## Customization

You can modify the script to:

- Add additional database setup steps
- Include seed data insertion
- Add backup/restore functionality
- Support multiple environments
- Add validation checks

## Support

If you encounter issues:

1. Check the prerequisites
2. Verify PostgreSQL configuration
3. Review the error messages
4. Check the EF migration status
5. Ensure you're in the correct directory
