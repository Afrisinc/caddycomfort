import { UserRole } from '@prisma/client';
import prisma from '../config/database';

const ROLES = Object.values(UserRole);

async function main() {
  const [email, role = UserRole.SUPER_ADMIN] = process.argv.slice(2);

  if (!email || !ROLES.includes(role as UserRole)) {
    console.error(`Usage: set-role <email> [${ROLES.join('|')}]`);
    process.exitCode = 1;
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    console.error(`No user found with email ${email}`);
    process.exitCode = 1;
    return;
  }

  if (user.role === role) {
    console.log(`${user.email} is already ${role}`);
    return;
  }

  await prisma.user.update({ where: { id: user.id }, data: { role: role as UserRole } });
  console.log(`${user.email}: ${user.role} → ${role}. Sign out and back in to see the change.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
