# Migrating from Legacy Python Version

This guide covers migrating from the legacy Python/Vue.js version to the current Angular/.NET Core implementation.

!!! warning "Major Architecture Change"
This is a significant architectural change. While we've maintained API compatibility where possible, some endpoints and functionality may have changed.

## Current Architecture

Mealie now uses a modern technology stack:

- **Frontend**: Angular with TypeScript and Angular Material
- **Backend**: .NET Core with Entity Framework Core
- **Database**: PostgreSQL (required - SQLite no longer supported)
- **Authentication**: Enhanced JWT-based authentication
- **API**: OpenAPI/Swagger documentation with improved type safety

## Pre-Migration Checklist

1. **Backup your data**: Create a complete backup of your current Mealie installation
2. **Export recipes**: Use the export functionality to create a backup file
3. **Document integrations**: Note any third-party integrations or custom scripts
4. **Review custom configurations**: Document any custom environment variables or settings

## Migration Steps

### 1. Export Data from Python Version

Before migrating, export all your data:

1. Log into your current Mealie instance
2. Go to **Settings** → **Backups**
3. Create a new backup
4. Download the backup file

### 2. Set Up Current Angular/.NET Version

Follow the [Docker Installation Guide](./installation/docker-install.md) to set up the current version.

Key requirements for the current setup:

- Use the current `docker-compose.yml` file
- Configure environment variables (see [Backend Configuration](./installation/dotnet-backend-config.md))
- PostgreSQL database is required
- JWT authentication configuration is mandatory

### 3. Import Your Data

1. Start the new Mealie instance
2. Create an admin account
3. Go to **Settings** → **Backups**
4. Upload and restore your backup file

## Configuration Changes

### Environment Variables

| Python Version         | Angular/.NET Version                   | Notes                                        |
| ---------------------- | -------------------------------------- | -------------------------------------------- |
| `API_PORT`             | `ASPNETCORE_URLS`                      | Use full URL format: `http://127.0.0.1:5000` |
| `TOKEN_TIME`           | `JWT__ExpirationMinutes`               | Time unit changed from hours to minutes      |
| `DB_ENGINE=sqlite`     | Not supported                          | PostgreSQL required                          |
| `POSTGRES_*` variables | `ConnectionStrings__DefaultConnection` | Use connection string format                 |
| `BASE_URL`             | `BASE_URL`                             | Same, used for CORS and notifications        |
| `ALLOW_SIGNUP`         | `ALLOW_SIGNUP`                         | Same functionality                           |

### New Required Variables

```env
# JWT Configuration (REQUIRED)
JWT__SecretKey=your-super-secret-jwt-key-change-in-production
JWT__Issuer=MealieApi
JWT__Audience=MealieAngular
JWT__ExpirationMinutes=60

# Database Connection String
ConnectionStrings__DefaultConnection=Host=postgres;Database=mealie;Username=mealie;Password=your_password
```

## API Changes

### Endpoint Structure

Most API endpoints remain the same, but some have changed:

| Python Version        | Angular/.NET Version  | Status        |
| --------------------- | --------------------- | ------------- |
| `/api/recipes`        | `/api/recipes`        | ✅ Compatible |
| `/api/users`          | `/api/users`          | ✅ Compatible |
| `/api/groups`         | `/api/groups`         | ✅ Compatible |
| `/api/households`     | `/api/households`     | ✅ Compatible |
| `/api/shopping-lists` | `/api/shopping-lists` | ✅ Compatible |
| `/api/foods`          | `/api/foods`          | ✅ Compatible |
| `/api/units`          | `/api/units`          | ✅ Compatible |
| `/api/auth/token`     | `/api/auth/login`     | ⚠️ Changed    |
| `/api/auth/refresh`   | `/api/auth/refresh`   | ✅ Compatible |

### Authentication Changes

The authentication flow has been improved:

**Python Version:**

```bash
POST /api/auth/token
{
  "username": "user@example.com",
  "password": "password"
}
```

**Angular/.NET Version:**

```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}
```

### Response Format Changes

Most response formats remain the same, but some have been standardized:

- Error responses now consistently use RFC 7807 Problem Details format
- Date/time fields use ISO 8601 format consistently
- Pagination responses have been standardized

## Integration Updates

### Home Assistant

Update your Home Assistant configuration to use the new authentication endpoint:

```yaml
# Old configuration
rest_command:
  mealie_import:
    url: "http://your-mealie-instance/api/recipes/create-url"
    method: POST
    headers:
      Authorization: "Bearer {{ states('input_text.mealie_token') }}"
# New configuration (same, but token obtained from /api/auth/login)
```

### Custom Scripts

Update any custom scripts that interact with the API:

1. **Authentication**: Use `/api/auth/login` instead of `/api/auth/token`
2. **Error Handling**: Update to handle new error response format
3. **Date Parsing**: Ensure proper ISO 8601 date parsing

## Feature Differences

### New Features in Angular/.NET Version

- **Improved Security**: Enhanced JWT authentication with configurable expiration
- **Better Performance**: .NET Core backend with Entity Framework optimizations
- **Modern UI**: Updated Angular frontend with Material Design
- **Enhanced API**: OpenAPI/Swagger documentation with better type safety
- **Improved Backup/Restore**: More reliable backup and restore functionality

### Removed Features

- **SQLite Support**: PostgreSQL is now required
- **Some Legacy Endpoints**: Deprecated endpoints have been removed
- **Python-Specific Features**: Features specific to the Python backend

## Troubleshooting Migration Issues

### Database Connection Issues

If you encounter database connection issues:

1. Ensure PostgreSQL is running and accessible
2. Check the connection string format
3. Verify database credentials
4. Check network connectivity between containers

### Authentication Issues

If authentication isn't working:

1. Verify JWT secret key is set correctly
2. Check JWT configuration (issuer, audience, expiration)
3. Clear browser cache and cookies
4. Verify user accounts were imported correctly

### Import/Export Issues

If backup import fails:

1. Verify the backup file is from a compatible version
2. Check application logs for specific error messages
3. Ensure sufficient disk space
4. Try importing smaller batches of data

### API Integration Issues

If existing integrations break:

1. Update authentication endpoint calls
2. Check for changed response formats
3. Update error handling logic
4. Verify endpoint URLs haven't changed

## Getting Help

If you encounter issues during migration:

1. **Check Logs**: Use `docker-compose logs -f` to view application logs
2. **Discord Community**: Join our [Discord server](https://discord.gg/QuStdQGSGK)
3. **GitHub Issues**: Report bugs on our [GitHub repository](https://github.com/mealie-recipes/mealie/issues)
4. **Documentation**: Review the updated documentation for configuration details

## Rollback Plan

If migration fails and you need to rollback:

1. Stop the new containers: `docker-compose down`
2. Restore your original Python version containers
3. Restore database from your pre-migration backup
4. Update any changed configurations

Keep your original setup and data until you've confirmed the migration is successful.

## Post-Migration Tasks

After successful migration:

1. **Test Core Functionality**: Verify recipes, users, and groups work correctly
2. **Update Integrations**: Update any third-party integrations to use new endpoints
3. **Update Documentation**: Update any internal documentation with new URLs/configs
4. **Monitor Performance**: Monitor the new system for any performance issues
5. **Update Backups**: Ensure backup processes work with the new system

## Performance Considerations

The Angular/.NET version typically offers better performance:

- **Faster API Responses**: .NET Core is generally faster than Python for web APIs
- **Better Database Performance**: Entity Framework with PostgreSQL optimizations
- **Improved Frontend**: Angular's optimized build process and lazy loading
- **Better Caching**: Enhanced caching strategies in the new architecture

## Security Improvements

The new version includes several security enhancements:

- **Improved JWT Handling**: Configurable expiration, secure signing
- **Enhanced CORS Protection**: Better cross-origin request handling
- **Security Headers**: Automatic security header configuration
- **Input Validation**: Improved input validation and sanitization
- **Dependency Updates**: Latest security patches in all dependencies
