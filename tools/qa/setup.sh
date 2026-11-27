#!/usr/bin/env bash
set -euo pipefail
if [[ -f package-lock.json ]]; then npm ci --ignore-scripts --no-audit --no-fund; elif node -e 'const p=require("./package.json");process.exit(Object.keys({...p.dependencies,...p.devDependencies}).length?0:1)'; then npm install --ignore-scripts --no-audit --no-fund; fi
npm ci --prefix tools/qa --ignore-scripts --no-audit --no-fund
