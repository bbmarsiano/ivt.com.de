# Docker Configuration

This directory contains Docker Compose configurations for local development.

## Directus

Directus CMS runs locally via Docker Compose, connected to the existing PostgreSQL database.

### Quick Start

1. **Copy environment file:**
   ```bash
   cp directus.env.example directus.env
   ```

2. **Edit `directus.env`:**
   - Generate random keys: `openssl rand -base64 32`
   - Set `KEY` and `SECRET` (Directus expects these exact names)
   - Set `ADMIN_EMAIL` and `ADMIN_PASSWORD`
   - Set `DB_PASSWORD` if your PostgreSQL requires it
   - **Note**: Variables are loaded directly from `env_file` - no interpolation needed

3. **Start Directus:**
   ```bash
   docker compose -f docker-compose.directus.yml up -d
   ```
   
   **Note**: The compose file automatically loads `directus.env` via `env_file`, so no `--env-file` flag is needed.

4. **Access Directus:**
   - Open http://localhost:8055
   - Login with your admin credentials

5. **Stop Directus:**
   ```bash
   docker compose -f docker-compose.directus.yml down
   ```

See `docs/03-cms-directus/01-local-setup.md` for detailed documentation.
