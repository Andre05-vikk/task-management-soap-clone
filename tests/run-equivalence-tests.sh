#!/bin/bash

# REST vs SOAP API Equivalence Tests Runner
echo "🚀 REST vs SOAP API Equivalence Tests Runner"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo -e "${BLUE}Waiting for $service_name to be ready...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is ready!${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}⏳ Attempt $attempt/$max_attempts - waiting for $service_name...${NC}"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ $service_name failed to start within expected time${NC}"
    return 1
}

# Check if both APIs are running
echo -e "${BLUE}Checking API status...${NC}"

SOAP_RUNNING=false
REST_RUNNING=false

if check_port 8000; then
    echo -e "${GREEN}✅ SOAP API is running on port 8000${NC}"
    SOAP_RUNNING=true
else
    echo -e "${YELLOW}⚠️  SOAP API is not running on port 8000${NC}"
fi

if check_port 5001; then
    echo -e "${GREEN}✅ REST API is running on port 5001${NC}"
    REST_RUNNING=true
else
    echo -e "${YELLOW}⚠️  REST API is not running on port 5001${NC}"
fi

# Start services if needed
if [ "$SOAP_RUNNING" = false ] || [ "$REST_RUNNING" = false ]; then
    echo -e "\n${YELLOW}Starting required services...${NC}"
    
    # Start SOAP API if not running
    if [ "$SOAP_RUNNING" = false ]; then
        echo -e "${BLUE}Starting SOAP API...${NC}"
        SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
        cd "$PROJECT_ROOT"
        npm start > soap-api.log 2>&1 &
        SOAP_PID=$!
        echo "SOAP API PID: $SOAP_PID"

        # Wait for SOAP API to be ready
        if ! wait_for_service "http://localhost:8000/task-service?wsdl" "SOAP API"; then
            echo -e "${RED}❌ Failed to start SOAP API${NC}"
            exit 1
        fi
    fi
    
    # Start REST API if not running
    if [ "$REST_RUNNING" = false ]; then
        echo -e "${BLUE}Starting REST API...${NC}"
        cd "$PROJECT_ROOT/notion-clone-api"

        # Check if .env file exists
        if [ ! -f .env ]; then
            echo -e "${YELLOW}⚠️  .env file not found. Creating default .env file...${NC}"
            node create-env.js
        fi

        # Start the REST API
        npm start > ../rest-api.log 2>&1 &
        REST_PID=$!
        echo "REST API PID: $REST_PID"

        # Wait for REST API to be ready
        if ! wait_for_service "http://localhost:5001/users" "REST API"; then
            echo -e "${RED}❌ Failed to start REST API${NC}"
            exit 1
        fi
    fi
    
    echo -e "${GREEN}✅ All services are now running!${NC}"
fi

# Install dependencies if needed
echo -e "\n${BLUE}Checking dependencies...${NC}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

if [ ! -d "node_modules" ] || [ ! -d "node_modules/axios" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

# Run the equivalence tests
echo -e "\n${BLUE}Running equivalence tests...${NC}"
echo "============================================="

npm run test:equivalence

TEST_EXIT_CODE=$?

# Cleanup: Kill started processes
if [ ! -z "$SOAP_PID" ]; then
    echo -e "\n${BLUE}Stopping SOAP API (PID: $SOAP_PID)...${NC}"
    kill $SOAP_PID 2>/dev/null || true
fi

if [ ! -z "$REST_PID" ]; then
    echo -e "${BLUE}Stopping REST API (PID: $REST_PID)...${NC}"
    kill $REST_PID 2>/dev/null || true
fi

# Final result
echo -e "\n============================================="
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}🎉 All equivalence tests completed successfully!${NC}"
    echo -e "${GREEN}✅ REST and SOAP APIs are functionally equivalent.${NC}"
else
    echo -e "${RED}❌ Some equivalence tests failed.${NC}"
    echo -e "${YELLOW}Check the test output above for details.${NC}"
fi

exit $TEST_EXIT_CODE
