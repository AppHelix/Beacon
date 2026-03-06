# Beacon App Local Setup Instructions

## 1. PostgreSQL Database Setup

### Prerequisites
Ensure PostgreSQL 13+ is installed and running. Choose one of the following approaches:

#### Option A: Install PostgreSQL Locally (Windows)
1. **Download and Install PostgreSQL:**
   - Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - Run the installer and complete the setup
   - Default port: `5432`
   - Remember the superuser password (default user: `postgres`)

2. **Create the Beacon Database:**
   Open Command Prompt or PowerShell and run:
   ```powershell
   psql -U postgres -h localhost
   ```
   Then execute:
   ```sql
   CREATE DATABASE beacon;
   ```

3. **Enable Required Extensions:**
   Connect to the beacon database:
   ```powershell
   psql -U postgres -h localhost -d beacon
   ```
   Then run:
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_trgm;
   CREATE EXTENSION IF NOT EXISTS vector;
   SELECT extname FROM pg_extension WHERE extname IN ('pg_trgm', 'vector');
   ```

#### Option B: Use Docker (Recommended for Development)
```bash
docker run --name beacon-postgres `
  -e POSTGRES_USER=user `
  -e POSTGRES_PASSWORD=password `
  -e POSTGRES_DB=beacon `
  -p 5432:5432 `
  -d postgres:15-alpine

# Enable extensions
docker exec beacon-postgres psql -U user -d beacon -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
docker exec beacon-postgres psql -U user -d beacon -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### Environment Configuration
Update `.env.local` with your database credentials:
```env
DATABASE_URL=postgres://user:password@localhost:5432/beacon
```

**Example values (adjust to your setup):**
- Local PostgreSQL: `postgres://postgres:your_password@localhost:5432/beacon`
- Docker: `postgres://user:password@localhost:5432/beacon` (matches Docker example above)

## 2. Run Database Migrations

Once PostgreSQL is running and extensions are enabled:

```bash
# Generate migrations from schema
npm run drizzle:generate

# Apply migrations to your database
npm run drizzle:push
```

**Verify the setup:**
```powershell
psql -U user -d beacon -h localhost
```
Then check for tables and extensions:
```sql
\dt -- list tables
\dx -- list extensions
SELECT * FROM pg_tables WHERE tablename IN ('users', 'engagements', 'signals', 'tech_tags');
```

---

## 3. Azure AD SSO Setup
- Register your app in Azure AD and obtain:
  - Client ID
  - Client Secret
  - Tenant ID
- Update `.env.local` with Azure AD credentials:
  ```env
  AZURE_AD_CLIENT_ID=<your-client-id>
  AZURE_AD_CLIENT_SECRET=<your-client-secret>
  AZURE_AD_TENANT_ID=<your-tenant-id>
  NEXTAUTH_URL=http://localhost:3000/api/auth/callback/azure-ad
  NEXTAUTH_SECRET=<your-nextauth-secret>
  ```
- Start the app and test login/logout at `/api/auth/signin` and `/api/auth/signout`.

---

## 4. Application Setup and Running

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

3. **Lint and type-check code:**
   ```bash
   npm run quality:check
   ```

4. **Run tests:**
   ```bash
   npm test           # Unit tests
   npm run test:e2e   # E2E tests with Playwright
   ```

---

## Troubleshooting

### PostgreSQL Connection Errors
- Check that PostgreSQL is running: `psql --version`
- Verify DATABASE_URL is correct in `.env.local`
- Test connection: `psql $DATABASE_URL -c "SELECT 1;"`

### Extension Not Found
```sql
-- Verify extensions are installed
SELECT extname FROM pg_extension;

-- If missing, install them
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS vector;
```

### Migration Issues
```bash
# Reset database (WARNING: This deletes all data)
npm run drizzle:push -- --force

# Check migration status
psql $DATABASE_URL -c "\dt"
```

> For more details, see the documentation in the `docs/` folder.
