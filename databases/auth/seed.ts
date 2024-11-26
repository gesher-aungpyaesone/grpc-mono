const { PrismaClient, SystemUserType, TokenType } = require('@prisma/auth-ms');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const staffPosition = await prisma.staffPosition.create({
    data: {
      name: 'Manager',
      description: 'Responsible for overseeing staff and operations.',
      created_by_id: 1,
      updated_by_id: 1,
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
      is_root: true,
      user_id: user.id,
      first_name: 'APS',
      last_name: 'DEV',
      email: 'aps@example.com',
      password: hashedPassword,
      department: 'Operations',
      position_id: staffPosition.id,
      bio: 'Experienced manager with a passion for leadership.',
      created_by_id: 1,
      updated_by_id: 1,
    },
  });

  const permissionTypes = ['create', 'show', 'list', 'edit', 'delete', 'export'];
  for (const type of permissionTypes) {
    await prisma.permissionType.create({
      data: { name: type },
    });
  }

  const permissionResource = await prisma.permissionResource.create({
    data: { name: 'staff' },
  });

  const staffPermissions = [
    {
      name: 'Create Staff',
      permissionType: 'create',
      resource: permissionResource,
    },
    {
      name: 'Show Staff',
      permissionType: 'show',
      resource: permissionResource,
    },
    {
      name: 'List Staff',
      permissionType: 'list',
      resource: permissionResource,
    },
    {
      name: 'Edit Staff',
      permissionType: 'edit',
      resource: permissionResource,
    },
    {
      name: 'Delete Staff',
      permissionType: 'delete',
      resource: permissionResource,
    },
    {
      name: 'Export Staff',
      permissionType: 'export',
      resource: permissionResource,
    },
  ];

  for (const perm of staffPermissions) {
    const permissionType = await prisma.permissionType.findUnique({
      where: { name: perm.permissionType },
    });

    await prisma.permission.create({
      data: {
        name: perm.name,
        type: { connect: { id: permissionType.id } },
        resource: { connect: { id: permissionResource.id } },
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
