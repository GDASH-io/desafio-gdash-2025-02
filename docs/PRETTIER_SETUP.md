# Prettier Configuration Guide

This project uses Prettier for consistent code formatting across frontend and backend.

## Configuration Files

### Root Level (`.prettierrc`)
- Shared configuration for all projects
- Located at: `g:\PROJETOS\desafio_gdash\.prettierrc`

### Frontend (`desafio_gdash/.prettierrc`)
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "bracketSpacing": true,
  "jsxSingleQuote": false,
  "quoteProps": "as-needed"
}
```

### Backend (`nestjs-api/.prettierrc`)
```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "bracketSpacing": true
}
```

## NPM Scripts

### Frontend (desafio_gdash/)
```bash
npm run format        # Format all source files
npm run format:check  # Check formatting without modifying files
```

### Backend (nestjs-api/)
```bash
npm run format        # Format all TypeScript files
npm run format:check  # Check formatting without modifying files
```

## Usage

### Format All Files
```bash
# Frontend
cd desafio_gdash
npm run format

# Backend
cd nestjs-api
npm run format
```

### Check Formatting (CI/CD)
```bash
# Frontend
cd desafio_gdash
npm run format:check

# Backend
cd nestjs-api
npm run format:check
```

## VS Code Integration

Add to `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## Current Status

✅ Prettier installed in both projects
✅ Configuration files created (.prettierrc + .prettierignore)
✅ NPM scripts added (format + format:check)
⚠️ **21 files in frontend need formatting**
⚠️ **24 files in backend need formatting**

## Next Steps

1. **Format all files** (optional):
   ```bash
   cd desafio_gdash && npm run format
   cd ../nestjs-api && npm run format
   ```

2. **Add to pre-commit hook** (recommended):
   - Install husky + lint-staged
   - Run Prettier on staged files before commit

3. **Add to CI/CD pipeline**:
   - Run `npm run format:check` in GitHub Actions
   - Fail build if formatting issues found
