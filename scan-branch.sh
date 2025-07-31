#!/bin/bash

# Exit on any error
set -e

echo "🔍 Scanning branch for exposed secrets..."

# Switch to the branch to scan
git checkout llm

# List of suspicious patterns to scan for
PATTERNS=(
  "sk-[a-zA-Z0-9]{32,}"              
  "OPENAI_API_KEY"
  "LLM_API_KEY"
  "Authorization: Bearer"
  "process.env"
  "dotenv.config"
  "apiKey\s*="
  "secret"
)

# Combine patterns into one grep regex
REGEX=$(IFS="|"; echo "${PATTERNS[*]}")

echo "🔎 Searching for potential API key exposures..."

# Scan relevant files
MATCHES=$(git grep -En --break --heading -e "$REGEX" -- \
  '*.js' '*.vue' '*.ts' '*.mjs' '*.cjs' '*.json' '*.env' '*.yaml' '*.yml' '*.html')

if [ -n "$MATCHES" ]; then
  echo "🚨 Potential secrets detected:"
  echo "$MATCHES"
  echo ""
  echo "❌ Please fix these before merging to main."
  exit 1
else
  echo "✅ No exposed secrets found in the 'llm' branch."
  exit 0
fi