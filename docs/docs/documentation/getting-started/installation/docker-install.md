# Docker Installation Guide

This guide covers installing Mealie using Docker. Mealie uses Angular for the frontend and .NET Core for the backend API.

## Quick Start

### Using Docker Compose (Recommended)

1. Create a directory for Mealie:

```bash
mkdir mealie
cd mealie
```

2. Download the docker-compose file:

```bash
curl -o docker-compose.yml https://raw.githubusercontent.com/mealie-recipes/mealie/main/docker/docker-compose.yml
```

3. Create environment file:

```bash
curl -o .env https://raw.githubusercontent.com/mealie-recipes/mealie/main/docker/environment.example
```

4. Edit the `.env` file with your settings:

```bash
nano .env
```

**Important:** Change these values in your `.env` file:

- `POSTGRES_PASSWORD` - Set a secure database password
- `JWT_SECRET_KEY` - Set a long, random string for JWT signing

5. Start Mealie:

```bash
docker-compose up -d
```

6. Access Mealie at `http://localhost:9091`

## Environment Configuration

### Required Settings

```env
# Database
POSTGRES_PASSWORD=change_this_secure_password

# JWT Security (REQUIRED - change this!)
JWT_SECRET_KEY=change-this-super-secret-jwt-key-in-production-make-it-very-long

# Application
ALLOW_SIGNUP=false
```

### Optional Settings

```env
# General
TZ=America/New_York
HTTP_PORT=9091

# Database
POSTGRES_DB=mealie
POSTGRES_USER=mealie
```

## Architecture

The Docker setup includes:

- **Nginx**: Serves the Angular frontend and proxies API requests
- **.NET Core API**: Backend application running on port 5000
- **PostgreSQL**: Database for storing recipes and user data
- **Angular Frontend**: Modern web application built with Angular

## Port Configuration

By default, Mealie uses:

- **Port 9091**: Main web interface (HTTP)
- **Port 5432**: PostgreSQL (internal to Docker network)
- **Port 5000**: .NET API (internal to Docker network)

To change the web port, modify `HTTP_PORT` in your `.env` file:

```env
HTTP_PORT=8080  # Access via http://localhost:8080
```

## Volume Mounts

Mealie stores data in Docker volumes:

- `mealie_data`: Application data, uploads, and backups
- `postgres_data`: PostgreSQL database files

### Custom Volume Paths

To use custom paths instead of Docker volumes:

```yaml
services:
  mealie:
    volumes:
      - /path/to/mealie/data:/app/data

  postgres:
    volumes:
      - /path/to/postgres/data:/var/lib/postgresql/data
```

## Security Considerations

### JWT Secret Key

**Critical**: Always change the JWT secret key in production:

```env
JWT_SECRET_KEY=your-super-long-random-secret-key-at-least-32-characters
```

Generate a secure key:

```bash
# Using openssl
openssl rand -base64 32

# Using pwgen
pwgen -s 32 1
```

### Database Password

Set a strong PostgreSQL password:

```env
POSTGRES_PASSWORD=your-secure-database-password
```

### User Registration

By default, user registration is disabled. Enable it only if needed:

```env
ALLOW_SIGNUP=true
```

## Reverse Proxy Setup

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name mealie.yourdomain.com;

    location / {
        proxy_pass http://localhost:9091;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Traefik

```yaml
services:
  mealie:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.mealie.rule=Host(`mealie.yourdomain.com`)"
      - "traefik.http.services.mealie.loadbalancer.server.port=80"
```

## Backup and Restore

### Backup

Mealie provides built-in backup functionality through the web interface or API.

### Manual Database Backup

```bash
docker-compose exec postgres pg_dump -U mealie mealie > mealie_backup.sql
```

### Restore Database

```bash
docker-compose exec -T postgres psql -U mealie mealie < mealie_backup.sql
```

## Updating Mealie

1. Stop the current containers:

```bash
docker-compose down
```

2. Pull the latest images:

```bash
docker-compose pull
```

3. Start with the new images:

```bash
docker-compose up -d
```

## Troubleshooting

### Check Container Status

```bash
docker-compose ps
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f mealie
docker-compose logs -f postgres
```

### Health Checks

Check if services are healthy:

```bash
# Web interface health
curl http://localhost:9091/health

# API health
curl http://localhost:9091/api/health
```

### Common Issues

#### CORS Errors

If you encounter CORS errors when accessing from a different domain, update the environment:

```env
BASE_URL=https://your-domain.com
```

#### Database Connection Issues

Ensure PostgreSQL is running and healthy:

```bash
docker-compose exec postgres pg_isready -U mealie
```

#### Permission Issues

If you encounter permission issues with volumes:

```env
PUID=1000  # Your user ID
PGID=1000  # Your group ID
```

Find your IDs with:

```bash
id $(whoami)
```

## Development Setup

For development with hot reload, use the development compose file:

```bash
curl -o docker-compose.dev.yml https://raw.githubusercontent.com/mealie-recipes/mealie/main/docker/docker-compose.dev.yml

docker-compose -f docker-compose.dev.yml up -d
```

This provides:

- Angular dev server: `http://localhost:4200`
- .NET API: `http://localhost:5000`
- PostgreSQL: `localhost:5432`

## Migration from Legacy Version

If migrating from a legacy version of Mealie:

1. Export your data from the previous version
2. Set up the current Mealie version
3. Import your data through the web interface
4. Update any integrations if needed

See the [Migration Guide](../migrating-python-to-angular-dotnet.md) for detailed migration instructions.

## Next Steps

- [Backend Configuration](./dotnet-backend-config.md)
- [API Usage Guide](../api-usage.md)
- [User Management](../usage/permissions-and-public-access.md)
