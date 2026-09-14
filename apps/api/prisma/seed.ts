import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';
import 'dotenv/config';

/**
 * Creates the first ADMIN. Without it a fresh deploy has no way in: creating an
 * account through /users already requires an ADMIN token, and /auth/register
 * only ever issues USER.
 *
 * Idempotent — running it again promotes and resets the password of the same
 * e-mail rather than failing, so it is safe to wire into a deploy.
 */
const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD to seed the first admin');
  }
  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters');
  }

  const hash = await argon2.hash(password);
  const admin = await prisma.user.upsert({
    where: { email },
    update: { password: hash, role: Role.ADMIN },
    create: { email, password: hash, role: Role.ADMIN, name: 'Admin' },
    select: { id: true, email: true, role: true },
  });

  // eslint-disable-next-line no-console
  console.log(`Seeded ${admin.role} ${admin.email} (${admin.id})`);
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
