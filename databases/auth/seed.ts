const { PrismaClient, SystemUserType, TokenType } = require('@prisma/auth-ms');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const staffPosition = await prisma.staffPosition.create({
    data: {
      name: 'Manager',
      description: 'Responsible for overseeing staff and operations.',
      created_by_id: 1,
      update_by_id: 1,
    },
  });

  const user = await prisma.user.create({
    data: {
      type: SystemUserType.STAFF,
    },
  });

  const hashedPassword = await bcrypt.hash('securepassword123', 10);

  const staff = await prisma.staff.create({
    data: {
      user_id: user.id,
      first_name: 'APS',
      last_name: 'DEV',
      email: 'aps@example.com',
      password: hashedPassword,
      department: 'Operations',
      position_id: staffPosition.id,
      bio: 'Experienced manager with a passion for leadership.',
      created_by_id: 1,
      update_by_id: 1,
    },
  });

  console.log('Initial staff created:', staff);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
