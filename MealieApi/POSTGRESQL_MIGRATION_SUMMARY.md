# PostgreSQL Migration Summary

This document summarizes all the changes made to convert the MealieApi project from Microsoft SQL Server (MSSQL) to PostgreSQL 17.

## Changes Made

### 1. Package References Updated

**File**: `MealieApi.Infrastructure/MealieApi.Infrastructure.csproj`

**Before**:

```xml
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="9.0.8" />
```

**After**:

```xml
<PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="9.0.0" />
```

**Additional Updates**:

- `Microsoft.EntityFrameworkCore.Design`: Updated to version 9.0.0
- `Microsoft.EntityFrameworkCore.Tools`: Updated to version 9.0.0

### 2. Database Provider Configuration

**File**: `MealieApi.Infrastructure/DependencyInjection.cs`

**Before**:

```csharp
services.AddDbContext<MealieDbContext>(options =>
    options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));
```

**After**:

```csharp
services.AddDbContext<MealieDbContext>(options =>
    options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));
```

### 3. Connection Strings Updated

**Files**:

- `MealieApi.WebApi/appsettings.json`
- `MealieApi.WebApi/appsettings.Development.json`

**Before** (MSSQL LocalDB):

```json
"DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=MealieApi;Trusted_Connection=true;MultipleActiveResultSets=true"
```

**After** (PostgreSQL):

```json
"DefaultConnection": "Host=localhost;Database=MealieApi;Username=postgres;Password=postgres;Port=5432"
```

### 4. Migrations Regenerated

**Removed Old MSSQL Migrations**:

- `20250809050015_InitialCreate.cs`
- `20250809050015_InitialCreate.Designer.cs`
- `MealieDbContextModelSnapshot.cs`

**Generated New PostgreSQL Migrations**:

- `20250811045620_InitialCreate.cs`
- `20250811045620_InitialCreate.Designer.cs`
- `MealieDbContextModelSnapshot.cs`

### 5. Data Type Mappings

The new migrations use PostgreSQL-compatible data types:

| MSSQL Type         | PostgreSQL Type            | Example                            |
| ------------------ | -------------------------- | ---------------------------------- |
| `uniqueidentifier` | `uuid`                     | `type: "uuid"`                     |
| `nvarchar(100)`    | `character varying(100)`   | `type: "character varying(100)"`   |
| `nvarchar(max)`    | `text`                     | `type: "text"`                     |
| `datetime2`        | `timestamp with time zone` | `type: "timestamp with time zone"` |
| `bit`              | `boolean`                  | `type: "boolean"`                  |
| `int`              | `integer`                  | `type: "integer"`                  |
| `decimal(18,2)`    | `numeric`                  | `type: "numeric"`                  |

## Verification Steps

### 1. Build Verification

```bash
dotnet build
```

✅ **Result**: Build successful with PostgreSQL packages

### 2. Migration Verification

```bash
dotnet ef migrations add InitialCreate --project MealieApi.Infrastructure --startup-project MealieApi.WebApi
```

✅ **Result**: PostgreSQL migration generated successfully

### 3. Package Compatibility

- ✅ Npgsql.EntityFrameworkCore.PostgreSQL 9.0.0
- ✅ Microsoft.EntityFrameworkCore.Design 9.0.0
- ✅ Microsoft.EntityFrameworkCore.Tools 9.0.0
- ✅ Compatible with .NET 9 runtime

## Next Steps

### 1. Database Setup

1. Install PostgreSQL 17 on your system
2. Create the MealieApi database
3. Update connection strings with actual credentials

### 2. Apply Migrations

```bash
dotnet ef database update --project MealieApi.Infrastructure --startup-project MealieApi.WebApi
```

### 3. Test Application

```bash
dotnet run --project MealieApi.WebApi
```

## Benefits of PostgreSQL 17

1. **Performance**: Improved query performance and JSON operations
2. **Open Source**: No licensing costs
3. **Cross-Platform**: Runs on Linux, Windows, and macOS
4. **Advanced Features**: JSON support, full-text search, advanced indexing
5. **Community**: Large, active community and extensive documentation

## Rollback Plan

If you need to revert to MSSQL:

1. Restore the original package references
2. Update `DependencyInjection.cs` to use `UseSqlServer()`
3. Restore MSSQL connection strings
4. Remove PostgreSQL migrations
5. Regenerate MSSQL migrations

## Files Modified

- ✅ `MealieApi.Infrastructure/MealieApi.Infrastructure.csproj`
- ✅ `MealieApi.Infrastructure/DependencyInjection.cs`
- ✅ `MealieApi.WebApi/appsettings.json`
- ✅ `MealieApi.WebApi/appsettings.Development.json`
- ✅ `MealieApi/README.md` (new)
- ✅ `MealieApi/POSTGRESQL_MIGRATION_SUMMARY.md` (new)

## Migration Status

**Status**: ✅ **COMPLETED**

The MealieApi project has been successfully converted from MSSQL to PostgreSQL 17. All necessary changes have been implemented, packages updated, and migrations regenerated with PostgreSQL-compatible data types.

