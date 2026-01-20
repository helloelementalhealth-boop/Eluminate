import { createApplication } from "@specific-dev/framework";
import * as appSchema from './db/schema.js';
import * as authSchema from './db/auth-schema.js';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';

const schema = { ...appSchema, ...authSchema };

export async function seedAdminUser() {
  const app = await createApplication(schema);

  try {
    // Check if admin user already exists
    const existingAdmin = await app.db
      .select()
      .from(authSchema.user)
      .where(eq(authSchema.user.email, 'admin@example.com'))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log('Admin user already exists, skipping seed');
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash('admin123', 10);

    // Create admin user
    const adminUser = await app.db
      .insert(authSchema.user)
      .values({
        id: `user_${Date.now()}`,
        name: 'Admin',
        email: 'admin@example.com',
        emailVerified: true,
        role: 'admin',
      })
      .returning();

    // Create account with password
    await app.db
      .insert(authSchema.account)
      .values({
        id: `account_${Date.now()}`,
        accountId: 'admin@example.com',
        providerId: 'email',
        userId: adminUser[0].id,
        password: passwordHash,
      })
      .returning();

    console.log('Admin user created successfully');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Failed to seed admin user:', error);
    throw error;
  }
}

// Run seed
seedAdminUser()
  .then(() => {
    console.log('Seed completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
