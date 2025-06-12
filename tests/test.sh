#!/bin/bash

# Navigate to project root
cd "$(dirname "$0")/.."

# Check if server is running
if ! curl -s "http://localhost:8000/task-service?wsdl" > /dev/null; then
  echo "Starting server..."
  node src/index.js &
  SERVER_PID=$!
  
  # Wait for server to start
  echo "Waiting for server to start..."
  sleep 5
else
  echo "Server is already running"
fi

# Run tests
echo "Running SOAP service tests..."
node tests/tests.js

# Kill server if we started it
if [ -n "$SERVER_PID" ]; then
  echo "Stopping server..."
  kill $SERVER_PID
fi
