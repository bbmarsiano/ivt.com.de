# Directus Local Setup Guide

This guide explains how to run Directus locally using Docker Compose, connected to the existing PostgreSQL database.

## Prerequisites

- Docker and Docker Compose installed
- PostgreSQL running locally with database `ivt_dev`
- Database user `dimitarmitrev` has access to `ivt_dev`

## Quick Start

1. **Copy environment file:**
   ```bash
   cp docker/directus.env.example docker/directus.env
   ```

2. **Edit `docker/directus.env`:**
   - Set `KEY` and `SECRET` to random strings (min 32 characters) - Directus expects these exact names
   - Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` for your admin account
   - Set `DB_PASSWORD` if your local PostgreSQL requires a password
   - **Note**: Variables are loaded directly from `env_file` - no interpolation needed

3. **Start Directus:**
   ```bash
   docker compose -f docker/docker-compose.directus.yml up -d
   ```
   
   **Note**: The `docker-compose.directus.yml` file includes `env_file: ./directus.env`, so environment variables are automatically loaded from `docker/directus.env`. No need to use `--env-file` flag.

4. **Access Directus:**
   - Open http://localhost:8055
   - Login with `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `directus.env`

5. **Stop Directus:**
   ```bash
   docker compose -f docker/docker-compose.directus.yml down
   ```

## Configuration

### Database Connection

Directus connects to the existing PostgreSQL database (`ivt_dev`) using:
- **Host**: `host.docker.internal` (allows Docker container to access host machine)
- **Port**: `5432`
- **Database**: `ivt_dev`
- **User**: `dimitarmitrev`
- **Password**: Set in `docker/directus.env` if required

### Environment Variables

All Directus configuration is in `docker/directus.env`. Variables are injected directly from `env_file` - no `${VAR}` interpolation is used in the compose file.

**Required variables in `docker/directus.env`:**

- `KEY` - Random key for Directus (min 32 characters)
- `SECRET` - Random secret for Directus (min 32 characters)
- `ADMIN_EMAIL` - Admin account email
- `ADMIN_PASSWORD` - Admin account password (use a strong password)
- `DB_PASSWORD` - PostgreSQL password (optional, leave empty if not required)

**Note**: Directus expects `KEY` and `SECRET` (not `DIRECTUS_KEY`/`DIRECTUS_SECRET`). Variables are loaded directly from `env_file`, preventing Docker Compose warnings about missing variables.

### Generating Random Keys

Generate secure random keys using:
```bash
# Generate KEY (for Directus)
openssl rand -base64 32

# Generate SECRET (for Directus)
openssl rand -base64 32
```

Add these to `docker/directus.env` as `KEY` and `SECRET`.

## Troubleshooting

### "Cannot connect to database"

**On macOS/Linux:**
- Ensure PostgreSQL is running: `pg_isready`
- Verify database exists: `psql -l | grep ivt_dev`
- Check `host.docker.internal` resolves correctly:
  ```bash
  ping host.docker.internal
  ```

**On Linux (if host.docker.internal doesn't work):**
- Find your host IP: `ip addr show docker0` or `hostname -I | awk '{print $1}'`
- Update `docker-compose.directus.yml`:
  ```yaml
  DB_HOST: 172.17.0.1  # or your host IP
  ```
- Or add `extra_hosts` to docker-compose:
  ```yaml
  extra_hosts:
    - "host.docker.internal:host-gateway"
  ```

**On Windows:**
- `host.docker.internal` should work by default
- If not, use your host IP address instead

### "Port 8055 already in use"

- Check what's using the port: `lsof -i :8055` (macOS/Linux) or `netstat -ano | findstr :8055` (Windows)
- Stop the conflicting service or change Directus port in `docker-compose.directus.yml`

### "Database user authentication failed"

- Verify PostgreSQL user exists: `psql -U dimitarmitrev -d ivt_dev`
- If password is required, set `DB_PASSWORD` in `docker/directus.env`
- Check PostgreSQL `pg_hba.conf` allows local connections

### Directus won't start

- Check logs: `docker compose -f docker/docker-compose.directus.yml logs`
- Verify environment file exists: `ls docker/directus.env`
- Ensure all required env vars are set in `directus.env`
- **Important**: Directus expects `KEY` and `SECRET` (not `DIRECTUS_KEY`/`DIRECTUS_SECRET`)
  - If you have an old `directus.env` with `DIRECTUS_KEY`/`DIRECTUS_SECRET`, rename them to `KEY`/`SECRET`

### CORS errors (when integrating with Next.js)

- Directus is configured to allow `http://localhost:3000`
- If using a different port, update `CORS_ORIGIN` in `docker-compose.directus.yml`

## Directus Admin Interface

After starting Directus:

1. Navigate to http://localhost:8055
2. Login with your admin credentials
3. You'll see the Directus admin interface
4. **Note**: Directus will create its own tables in the `ivt_dev` database (prefixed with `directus_*`)
5. These tables won't conflict with Prisma's `ProjectApplication` table

## Next Steps

Once Directus is running:

1. Create collections matching your content types (Projects, News, Events, Testimonials)
2. Import or create initial content
3. Update `services/contentService.ts` to fetch from Directus API
4. See `docs/03-cms-directus/` for integration guides (to be created)

## Useful Commands

```bash
# Start Directus (env_file is automatically loaded from docker/directus.env)
docker compose -f docker/docker-compose.directus.yml up -d

# Stop Directus
docker compose -f docker/docker-compose.directus.yml down

# View logs
docker compose -f docker/docker-compose.directus.yml logs -f

# Restart Directus
docker compose -f docker/docker-compose.directus.yml restart

# Check status
docker compose -f docker/docker-compose.directus.yml ps
```

## Security Notes

- **Never commit `docker/directus.env`** - it contains secrets
- Use strong passwords for `ADMIN_PASSWORD`
- Generate secure random values for `KEY` and `SECRET` (using `openssl rand -base64 32`)
- Variables are loaded directly from `env_file` - no `${VAR}` interpolation is used, preventing Docker Compose warnings
- In production, use environment-specific configuration and secrets management
