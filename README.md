# Mealie

A self-hosted recipe manager and meal planner with a modern Angular frontend and .NET Core backend API.

[![Discord](https://img.shields.io/discord/732307262621245472?logo=discord&logoColor=white&style=flat-square)](https://discord.gg/QuStdQGSGK)
[![License](https://img.shields.io/github/license/mealie-recipes/mealie?style=flat-square)](https://github.com/mealie-recipes/mealie/blob/main/LICENSE)
[![Docker Pulls](https://img.shields.io/docker/pulls/mealierecipes/mealie?style=flat-square)](https://hub.docker.com/r/mealierecipes/mealie)

## ✨ Features

- 🔍 **Smart Search** - Mix & match quoted literal searches and keyword search with fuzzy search support
- 🏷️ **Recipe Organization** - Tag recipes with categories or tags for flexible sorting
- 🕸 **Web Import** - Import recipes from around the web by URL
- 📱 **Progressive Web App** - Mobile-first responsive design
- 📆 **Meal Planning** - Create and manage meal plans
- 🛒 **Shopping Lists** - Generate shopping lists from recipes and meal plans
- 🏠 **Multi-Tenant** - Separate users into households and share recipes
- 🎨 **Customizable** - Color themed layouts and localization support
- 🔐 **Secure** - JWT-based authentication with role-based permissions
- 📊 **Analytics** - Recipe usage statistics and reporting
- 🔄 **Import/Export** - Migration from other platforms and backup functionality

## 🏗️ Architecture

Mealie uses a modern technology stack:

- **Frontend**: [Angular](https://angular.io/) with TypeScript and Angular Material
- **Backend**: [.NET Core](https://dotnet.microsoft.com/) with Entity Framework Core
- **Database**: [PostgreSQL](https://www.postgresql.org/) with full-text search
- **Authentication**: JWT-based with configurable expiration
- **API**: RESTful API with OpenAPI/Swagger documentation
- **Deployment**: Docker containerization with Nginx reverse proxy

### Project Structure

```
mealie/
├── mealie-angular/              # Angular frontend application
├── MealieApi/                   # .NET Core backend API
├── docker/                     # Docker configurations
├── docs/                       # Documentation
├── frontend(deprecated)/        # Legacy Vue.js frontend
└── mealie(deprecated)/          # Legacy Python backend
```

## 🚀 Quick Start

### Docker (Recommended)

1. **Create directory and download configuration:**
   ```bash
   mkdir mealie && cd mealie
   curl -o docker-compose.yml https://raw.githubusercontent.com/mealie-recipes/mealie/main/docker/docker-compose.yml
   curl -o .env https://raw.githubusercontent.com/mealie-recipes/mealie/main/docker/environment.example
   ```

2. **Configure environment variables:**
   ```bash
   nano .env
   ```
   **Important:** Change `POSTGRES_PASSWORD` and `JWT_SECRET_KEY` in production!

3. **Start Mealie:**
   ```bash
   docker-compose up -d
   ```

4. **Access Mealie:** http://localhost:9091

### Development Setup

See the [Development Guide](https://docs.mealie.io/contributors/developers-guide/angular-dotnet-dev-setup/) for detailed setup instructions.

## 📖 Documentation

- **Installation Guide**: [docs.mealie.io/getting-started/installation](https://docs.mealie.io/documentation/getting-started/installation/docker-install/)
- **API Documentation**: [docs.mealie.io/api](https://docs.mealie.io/api/redoc/)
- **User Guide**: [docs.mealie.io](https://docs.mealie.io/)
- **Development**: [docs.mealie.io/contributors](https://docs.mealie.io/contributors/developers-guide/angular-dotnet-dev-setup/)

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET_KEY` | *required* | Secret key for JWT token signing |
| `POSTGRES_PASSWORD` | mealie_password | PostgreSQL password |
| `HTTP_PORT` | 9091 | Port for web interface |
| `ALLOW_SIGNUP` | false | Allow user registration |

See [Backend Configuration](https://docs.mealie.io/documentation/getting-started/installation/dotnet-backend-config/) for complete configuration options.

## 🐳 Docker Images

- **Latest Stable**: `mealierecipes/mealie:latest`
- **Development**: `mealierecipes/mealie:nightly`

### Supported Architectures

- `linux/amd64` (x86_64)
- `linux/arm64` (ARM64/aarch64)
- `linux/arm/v7` (ARMv7)

## 🔄 Migration

### From Legacy Python Version

If you're upgrading from the legacy Python/Vue.js version:

1. **Export your data** from the old version
2. **Follow the [Migration Guide](https://docs.mealie.io/documentation/getting-started/migrating-python-to-angular-dotnet/)**
3. **Import your data** into the new version

### From Other Platforms

Mealie supports importing from:
- Chowdown
- Nextcloud Cookbook
- Copy Me That
- Paprika
- Tandoor Recipes

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](https://docs.mealie.io/contributors/non-coders/) for details.

### Development

1. **Fork the repository**
2. **Set up development environment**: [Development Guide](https://docs.mealie.io/contributors/developers-guide/angular-dotnet-dev-setup/)
3. **Make your changes**
4. **Submit a pull request**

### Reporting Issues

- **Bug Reports**: [GitHub Issues](https://github.com/mealie-recipes/mealie/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/mealie-recipes/mealie/discussions)
- **Community Support**: [Discord](https://discord.gg/QuStdQGSGK)

## 📊 Stats

- 🌟 GitHub Stars: Growing community of recipe enthusiasts
- 🐳 Docker Pulls: Millions of downloads
- 🌍 Languages: Localized in 40+ languages
- 👥 Contributors: Open source community driven

## 💖 Support

If you find Mealie useful, consider:

- ⭐ **Starring** the repository
- 🐛 **Reporting bugs** and suggesting features
- 💬 **Joining** our [Discord community](https://discord.gg/QuStdQGSGK)
- 💝 **Contributing** code or documentation

<a href="https://www.buymeacoffee.com/haykot" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-green.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" >
</a>

## 📄 License

This project is licensed under the [AGPL-3.0 License](LICENSE) - see the LICENSE file for details.

## 🔗 Links

- **Website**: [mealie.io](https://mealie.io/)
- **Documentation**: [docs.mealie.io](https://docs.mealie.io/)
- **Demo**: [demo.mealie.io](https://demo.mealie.io/)
- **Discord**: [Join our community](https://discord.gg/QuStdQGSGK)
- **GitHub**: [mealie-recipes/mealie](https://github.com/mealie-recipes/mealie)

---

## 🏛️ Architecture Evolution

Mealie has evolved from its original Vue.js/Python (FastAPI) architecture to the current Angular/.NET Core implementation for improved performance, maintainability, and modern development practices. Legacy components are maintained in `(deprecated)` directories for reference and migration purposes.