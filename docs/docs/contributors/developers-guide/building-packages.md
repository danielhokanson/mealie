# Building Packages

Released packages are [built and published via GitHub actions](maintainers.md#drafting-releases).

## .NET Packages

The Mealie .NET backend can be built and packaged using standard .NET tooling.

### Building the Backend

To build the .NET backend locally:

```bash
cd MealieApi
dotnet restore
dotnet build --configuration Release
```

### Publishing the Backend

To create a self-contained deployment:

```bash
cd MealieApi
dotnet publish src/MealieApi.WebApi/MealieApi.WebApi.csproj \
    --configuration Release \
    --output ./dist/backend \
    --self-contained false
```

For a framework-dependent deployment (smaller size):

```bash
dotnet publish src/MealieApi.WebApi/MealieApi.WebApi.csproj \
    --configuration Release \
    --output ./dist/backend \
    --self-contained false \
    --runtime linux-x64
```

## Angular Frontend

### Building the Frontend

To build the Angular frontend:

```bash
cd mealie-angular
npm install
ng build --configuration production
```

The built files will be in `mealie-angular/dist/mealie-angular/`.

### Building with Specific Configuration

For different environments:

```bash
# Development build
ng build --configuration development

# Production build (optimized)
ng build --configuration production

# Build with specific base href
ng build --base-href /mealie/
```

## Docker Image

### Building the Complete Application

To build the Docker image with both Angular frontend and .NET backend:

```bash
cd docker
docker build --tag mealie:dev --file Dockerfile ..
```

### Development Docker Setup

For development with hot reload:

```bash
cd docker
docker-compose -f docker-compose.dev.yml up --build
```

This creates separate containers for:

- Angular development server (port 4200)
- .NET API with hot reload (port 5000)
- PostgreSQL database (port 5432)

### Production Docker Setup

For production deployment:

```bash
cd docker
docker-compose up --build -d
```

This creates a single optimized container with:

- Nginx serving the Angular frontend
- .NET backend API
- PostgreSQL database

### Custom Build Arguments

You can customize the build with build arguments:

```bash
docker build \
  --tag mealie:custom \
  --build-arg ASPNETCORE_ENVIRONMENT=Production \
  --file docker/Dockerfile \
  ..
```

### Multi-Architecture Builds

For building images that support multiple architectures:

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag mealie:multi-arch \
  --file docker/Dockerfile \
  ..
```
