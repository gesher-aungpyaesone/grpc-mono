const { PrismaClient, SystemUserType, TokenType } = require('@prisma/auth-ms');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Create a staff position
  const staffPosition = await prisma.staffPosition.create({
    data: {
      name: 'Manager',
      description: 'Responsible for overseeing staff and operations.',
      created_by_id: 1,
      updated_by_id: 1,
    },
  });

  // Create the root staff user
  const rootUser = await prisma.user.create({
    data: {
      type: SystemUserType.STAFF,
    },
  });

  const hashedRootPassword = await bcrypt.hash('rootpassword123', 10);

  const rootStaff = await prisma.staff.create({
    data: {
      is_root: true,
      user_id: rootUser.id,
      first_name: 'Root',
      last_name: 'Staff',
      email: 'root@example.com',
      password: hashedRootPassword,
      department: 'Administration',
      position_id: staffPosition.id,
      bio: 'Root staff with full administrative access.',
      created_by_id: 1,
      updated_by_id: 1,
    },
  });

  // Create 9 normal staff users
  const staffMembers = [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      department: 'Sales',
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      department: 'Marketing',
    },
    {
      firstName: 'Paul',
      lastName: 'Adams',
      email: 'paul.adams@example.com',
      department: 'IT',
    },
    {
      firstName: 'Sarah',
      lastName: 'Brown',
      email: 'sarah.brown@example.com',
      department: 'HR',
    },
    {
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@example.com',
      department: 'Finance',
    },
    {
      firstName: 'Michael',
      lastName: 'Wilson',
      email: 'michael.wilson@example.com',
      department: 'Operations',
    },
    {
      firstName: 'David',
      lastName: 'Taylor',
      email: 'david.taylor@example.com',
      department: 'Sales',
    },
    {
      firstName: 'Rachel',
      lastName: 'Miller',
      email: 'rachel.miller@example.com',
      department: 'Marketing',
    },
    {
      firstName: 'Daniel',
      lastName: 'Clark',
      email: 'daniel.clark@example.com',
      department: 'IT',
    },
  ];

  for (const member of staffMembers) {
    const user = await prisma.user.create({
      data: {
        type: SystemUserType.STAFF,
      },
    });

    const hashedPassword = await bcrypt.hash('staffpassword123', 10);

    await prisma.staff.create({
      data: {
        is_root: false,
        user_id: user.id,
        first_name: member.firstName,
        last_name: member.lastName,
        email: member.email,
        password: hashedPassword,
        department: member.department,
        position_id: staffPosition.id,
        bio: `${member.firstName} ${member.lastName} working in the ${member.department} department.`,
        created_by_id: 1,
        updated_by_id: 1,
      },
    });
  }

  const permissionTypes = ['create', 'read', 'edit', 'delete', 'assign'];
  for (const type of permissionTypes) {
    await prisma.permissionType.create({
      data: { name: type },
    });
  }

  // Create permission staff resource
  const permissionStaffResource = await prisma.permissionResource.create({
    data: { name: 'staff' },
  });

  const permissionStaffPermissionResource = await prisma.permissionResource.create({
    data: { name: 'staff-permission' },
  });

  // Create permissions for staff
  const staffPermissions = [
    {
      name: '[Staff] Create Staff',
      permissionType: 'create',
      resource: permissionStaffResource,
    },
    {
      name: '[Staff] Read Staff',
      permissionType: 'read',
      resource: permissionStaffResource,
    },
    {
      name: '[Staff] Edit Staff',
      permissionType: 'edit',
      resource: permissionStaffResource,
    },
    {
      name: '[Staff] Delete Staff',
      permissionType: 'delete',
      resource: permissionStaffResource,
    },
    {
      name: '[Staff] Assign Staff Permission',
      permissionType: 'assign',
      resource: permissionStaffPermissionResource,
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
        resource: { connect: { id: permissionStaffResource.id } },
      },
    });
  }

  // Create permission staff resource
  const permissionPositionResource = await prisma.permissionResource.create({
    data: { name: 'staff-position' },
  });

  // Create permissions for staff position
  const staffPositionPermissions = [
    {
      name: '[Position] Create Staff Position',
      permissionType: 'create',
      resource: permissionPositionResource,
    },
    {
      name: '[Position] Read Staff Position',
      permissionType: 'read',
      resource: permissionPositionResource,
    },
    {
      name: '[Position] Edit Staff Position',
      permissionType: 'edit',
      resource: permissionPositionResource,
    },
    {
      name: '[Position] Delete Staff Position',
      permissionType: 'delete',
      resource: permissionPositionResource,
    },
  ];

  for (const perm of staffPositionPermissions) {
    const permissionType = await prisma.permissionType.findUnique({
      where: { name: perm.permissionType },
    });

    await prisma.permission.create({
      data: {
        name: perm.name,
        type: { connect: { id: permissionType.id } },
        resource: { connect: { id: permissionPositionResource.id } },
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
