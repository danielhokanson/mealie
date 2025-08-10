#!/bin/bash
# =================================================================
# Start Mealie Development Environment
# =================================================================

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Mealie Development Environment${NC}"

# Navigate to docker directory
cd "$(dirname "$0")/.."

# Start development environment
echo -e "${GREEN}🔨 Starting development services...${NC}"
docker-compose -f docker-compose.dev.yml up --build -d

# Wait for services
echo -e "${BLUE}⏳ Waiting for services...${NC}"
sleep 15

echo -e "${GREEN}🎉 Development environment started!${NC}"
echo -e "${BLUE}📱 Angular Frontend: http://localhost:4200${NC}"
echo -e "${BLUE}🔧 .NET API: http://localhost:5000${NC}"
echo -e "${BLUE}🗄️  PostgreSQL: localhost:5432${NC}"

echo -e "${YELLOW}📝 Logs: docker-compose -f docker-compose.dev.yml logs -f${NC}"
echo -e "${YELLOW}🛑 Stop: docker-compose -f docker-compose.dev.yml down${NC}"
