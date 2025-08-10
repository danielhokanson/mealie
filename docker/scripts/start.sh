#!/bin/bash
# =================================================================
# Start Mealie (Production)
# =================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Mealie (Angular + .NET)${NC}"

# Navigate to docker directory
cd "$(dirname "$0")/.."

# Check if environment file exists
if [ ! -f ".env" ]; then
    if [ -f "environment.example" ]; then
        echo -e "${YELLOW}⚠️  Creating .env from example${NC}"
        cp environment.example .env
        echo -e "${YELLOW}⚠️  Please review .env file settings${NC}"
    fi
fi

# Start services
echo -e "${GREEN}🔨 Starting services...${NC}"
docker-compose up --build -d

# Wait for services
echo -e "${BLUE}⏳ Waiting for services...${NC}"
sleep 15

# Check health
if curl -f http://localhost:9091/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Mealie is running!${NC}"
    echo -e "${BLUE}🌐 Access: http://localhost:9091${NC}"
else
    echo -e "${YELLOW}⚠️  Still starting up...${NC}"
fi

echo -e "${YELLOW}📝 Logs: docker-compose logs -f${NC}"
echo -e "${YELLOW}🛑 Stop: docker-compose down${NC}"
