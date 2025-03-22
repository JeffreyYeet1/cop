#!/bin/bash

echo "Testing root endpoint..."
curl http://localhost:8000/

echo -e "\n\nTesting signup..."
curl -X POST http://localhost:8000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "name": "Test User"
  }'

echo -e "\n\nTesting signin..."
TOKEN=$(curl -s -X POST http://localhost:8000/api/signin \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=testpassword123&scope=me" | jq -r '.access_token')

echo -e "\n\nTesting /me endpoint with token..."
curl http://localhost:8000/api/me \
  -H "Authorization: Bearer $TOKEN" 