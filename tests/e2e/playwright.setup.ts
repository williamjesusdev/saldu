import { Client } from "pg";
import {
  TEST_ADMIN_EMAIL,
  TEST_SETTINGS_USER_EMAIL,
  TEST_SUBSCRIPTION_ID,
  TEST_USER_EMAIL,
} from "./tests/utils/test-helpers";

async function globalSetup() {
  console.log("Seeding database for E2E tests...");

  if (!process.env.E2E_DATABASE_URL) {
    throw new Error("E2E_DATABASE_URL environment variable is not defined");
  }

  let client: Client | null = null;

  try {
    console.log("Connecting to database:", process.env.E2E_DATABASE_URL);
    client = new Client({ connectionString: process.env.E2E_DATABASE_URL });
    await client.connect();

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
    const user = await client.query(
      "SELECT EXISTS (SELECT * FROM users WHERE email = $1)",
      [TEST_USER_EMAIL],
    );
    if (user.rows[0].exists) {
      console.log("Test user already exists. Proceeding with tests.");
      return;
    }

    // 3.1. Fetch the Argon2 hash generated for the admin to reuse it
    const adminUser = await client.query(
      "SELECT password_hash FROM users WHERE email = $1",
      [TEST_ADMIN_EMAIL],
    );
    if (adminUser.rows.length === 0) {
      console.log(
        "Admin user not found. Cannot copy Argon2 hash. Skipping user seed.",
      );
      return;
    }

    const commonHash = adminUser.rows[0].password_hash;

    // 4. Insert the subscription first to satisfy foreign key constraints
    await client.query(
      `INSERT INTO subscriptions (id, plan) VALUES ($1, 'TEST') ON CONFLICT (id) DO NOTHING`,
      [TEST_SUBSCRIPTION_ID],
    );

    // 5. Insert predictable test users for CI runs if they don't exist
    await client.query(
      `INSERT INTO users (subscription_id, email, password_hash, name, role)
         VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING`,
      [
        TEST_SUBSCRIPTION_ID,
        TEST_USER_EMAIL,
        commonHash,
        "E2E Test User",
        "USER",
      ],
    );

    // 6. Insert dedicated user for settings tests (to avoid race conditions with password update and deletion)
    await client.query(
      `INSERT INTO users (subscription_id, email, password_hash, name, role)
         VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING`,
      [
        TEST_SUBSCRIPTION_ID,
        TEST_SETTINGS_USER_EMAIL,
        commonHash,
        "E2E Settings User",
        "USER",
      ],
    );

    console.log("Test users successfully inserted.");
  } catch (err) {
    console.error("Error seeding DB during E2E global setup:", err);
  } finally {
    if (client) {
      await client.end().catch(() => {});
    }
  }
}

export default globalSetup;
