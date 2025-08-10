# About The Project

Mealie is a self hosted recipe manager and meal planner with a modern .NET Core backend API and a reactive Angular frontend application for a pleasant user experience for the whole family. Easily add recipes into your database by providing the url and Mealie will automatically import the relevant data or add a family recipe with the UI editor. Mealie also provides a comprehensive RESTful API for interactions from 3rd party applications.

[Remember to join the Discord](https://discord.gg/QuStdQGSGK)

## Key Features

- 🔍 Smart search, mix & match of "quoted literal searches" and keyword search. Fuzzy search ("is it brocolli or broccoli?") is also available when using a Postgres database.
- 🏷️ Tag recipes with categories or tags for flexible sorting
- 🕸 Import recipes from around the web by URL
- 📱 Progressive Web App
- 📆 Create Meal Plans
- 🛒 Generate Shopping Lists
- 🏠 Separate Users into Households and share Recipes
- 🐳 Easy setup with Docker
- 🎨 Customize your interface with color themed layouts
- 🌍 localized in many languages
- ➕ Plus tons more!
  - Flexible RESTful API
    - Custom key/value pairs for recipes
    - Webhook support
    - Interactive API Documentation with OpenAPI/Swagger
    - JWT-based authentication
  - Raw JSON Recipe Editor
  - Migration from other platforms
    - Chowdown
    - Nextcloud Cookbook
    - Copy Me That
    - Paprika
    - Tandoor Recipes
  - Random Meal Plan generation
    - Advanced rule configuration to fine tune random recipes

## FAQ

See the [Frequently Asked Questions page](./faq.md)

## Built With

- [Angular](https://angular.io/) - Modern TypeScript frontend framework
- [Angular Material](https://material.angular.io/) - Material Design components for Angular
- [.NET Core](https://dotnet.microsoft.com/) - Cross-platform backend framework
- [Entity Framework Core](https://docs.microsoft.com/en-us/ef/core/) - Modern object-database mapper
- [PostgreSQL](https://www.postgresql.org/) - Advanced open source relational database
- [Docker](https://www.docker.com/) - Containerization platform

!!! note "Architecture Evolution"
Mealie has evolved from its original Vue.js/Python (FastAPI) architecture to the current Angular/.NET Core implementation for improved performance, maintainability, and modern development practices.

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, develop, and create. Any contributions you make are **greatly appreciated**. See the [Contributors Guide](../../contributors/non-coders.md) for help getting started.

If you are not a coder, you can still contribute financially. Financial contributions help me prioritize working on this project over others and help me to know that there is a real demand for project development.

<a href="https://www.buymeacoffee.com/haykot" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-green.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>
