import bcrypt from "bcryptjs";
import { Client } from "pg";

/**
 * Shared E2E Test Credentials and Data
 * These constants should be imported by individual test files to authenticate and interact
 * with the system acting as the seeded E2E user.
 */
export const TEST_USER_EMAIL = "e2e-user@saldu.com";
export const TEST_SUBSCRIPTION_ID = "00000000-0000-0000-0000-000000000000";
export const TEST_USER_CREDENTIAL = "E2eSecret!123";
const TEST_USER_CREDENTIAL_HASH = bcrypt.hashSync(TEST_USER_CREDENTIAL, 10);

async function globalSetup() {
  console.log("Seeding database for E2E tests...");

  if (!process.env.E2E_DATABASE_URL) {
    throw new Error("E2E_DATABASE_URL environment variable is not defined");
  }

  console.log("Connecting to database:", process.env.E2E_DATABASE_URL);
  const client = new Client({ connectionString: process.env.E2E_DATABASE_URL });
  await client.connect();

  try {
    // 1. Check if Flyway has initialized the schema (history table exists)
    const flywayCheck = await client.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'flyway_schema_history')",
    );
    if (!flywayCheck.rows[0].exists) {
      console.log(
        "Flyway history table not found. Migrations have not run. Skipping user seed.",
      );
      return;
    }

    // 2. Check if the 'users' table exists (to avoid crashing before the feature is implemented)
    const usersCheck = await client.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')",
    );
    if (!usersCheck.rows[0].exists) {
      console.log(
        "Table 'users' is not yet implemented in the database. Skipping user seed.",
      );
      return;
    }

    // 3. Check if the test user already exists
    const user = await client.query("SELECT EXISTS (SELECT * FROM users WHERE email = $1)", [
      TEST_USER_EMAIL,
    ]);

    if (user.rows[0].exists) {
      console.log("Test user already exists. Proceeding with tests.");
      return;
    }

    // 4. Insert a predictable test user for CI runs if it doesn't exist
    await client.query(
      `INSERT INTO users (subscription_id, email, password_hash, platform_admin, active)
         VALUES ($1, $2, $3, false, true)`,
      [TEST_SUBSCRIPTION_ID, TEST_USER_EMAIL, TEST_USER_CREDENTIAL_HASH],
    );

    console.log("Test user successfully inserted.");
  } catch (err) {
    console.error("Error seeding DB during E2E global setup:", err);
  } finally {
    await client.end();
  }
}

export default globalSetup;
