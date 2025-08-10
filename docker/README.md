# Mealie Docker Setup

This directory contains Docker configurations for running Mealie with Angular frontend and .NET backend.

## Quick Start

### Production

```bash
cd docker
cp environment.example .env
# Edit .env with your settings
./scripts/start.sh
```

Access Mealie at: http://localhost:9091

### Development

```bash
cd docker
./scripts/start-dev.sh
```

- Angular Frontend: http://localhost:4200
- .NET API: http://localhost:5000
- PostgreSQL: localhost:5432

## Files

- `Dockerfile` - Main production image
- `Dockerfile.dev` - Development image
- `docker-compose.yml` - Production services
- `docker-compose.dev.yml` - Development services
- `environment.example` - Environment configuration template
- `nginx/default.conf` - Nginx configuration
- `supervisor/supervisord.conf` - Process manager config
- `postgres/init.sql` - Database initialization

## Services

### Production

- **mealie** - Combined Angular + .NET application
- **postgres** - PostgreSQL database

### Development

- **mealie-frontend** - Angular development server
- **mealie-api** - .NET API with hot reload
- **postgres** - PostgreSQL database

## Environment Variables

Key variables in `.env`:

- `HTTP_PORT` - Port for web access (default: 9091)
- `POSTGRES_PASSWORD` - Database password
- `JWT_SECRET_KEY` - JWT signing key
- `ALLOW_SIGNUP` - Allow user registration

## Commands

```bash
# Start production
docker-compose up -d

# Start development
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild images
docker-compose up --build -d
```
