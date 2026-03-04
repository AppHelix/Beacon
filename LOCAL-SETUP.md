# Beacon App Local Setup Instructions

## 1. PostgreSQL Database
- Install PostgreSQL (local or Docker)
- Create a database named `beacon`
- Enable the `pg_trgm` extension:
  ```sql
  CREATE EXTENSION IF NOT EXISTS pg_trgm;
  ```
- (Optional for future AI features) Enable `pgvector`:
  ```sql
  CREATE EXTENSION IF NOT EXISTS vector;
  ```

## 2. Azure AD SSO Setup
- Register your app in Azure AD and obtain:
  - Client ID
  - Client Secret
  - Tenant ID
- Copy `.env.template` to `.env.local` and fill in:
  ```env
  AZURE_AD_CLIENT_ID=<your-client-id>
  AZURE_AD_CLIENT_SECRET=<your-client-secret>
  AZURE_AD_TENANT_ID=<your-tenant-id>
  NEXTAUTH_URL=http://localhost:3000
  NEXTAUTH_SECRET=<your-nextauth-secret>
  ```
- Start the app and test login/logout at `/api/auth/signin` and `/api/auth/signout`.

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Run the development server:**
   ```sh
   npm run dev
   ```
3. **Lint and format code:**
   ```sh
   npm run lint
   npm run format
   ```
4. **Run tests (if configured):**
   ```sh
   npm test
   ```

> For more details, see the documentation in the `docs/` folder.
