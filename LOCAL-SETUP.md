# Beacon App Local Setup Instructions

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Copy environment template:**
   ```sh
   cp .env.template .env.local
   ```
   Fill in all required values in `.env.local`.
3. **Run the development server:**
   ```sh
   npm run dev
   ```
4. **Lint and format code:**
   ```sh
   npm run lint
   npm run format
   ```
5. **Run tests (if configured):**
   ```sh
   npm test
   ```

> For more details, see the documentation in the `docs/` folder.
