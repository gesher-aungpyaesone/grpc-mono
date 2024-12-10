const { PrismaClient, SystemUserType, TokenType } = require('@prisma/auth-ms');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Create staff departments
  const adminDepartment = await prisma.staffDepartment.create({
    data: {
      name: 'Administration',
      description: 'Administration',
      created_by_id: 1,
      updated_by_id: 1,
    },
  });
  const itDepartment = await prisma.staffDepartment.create({
    data: {
      name: 'IT',
      description: 'Information Technology department',
      created_by_id: 1,
      updated_by_id: 1,
    },
  });

  const marketingDepartment = await prisma.staffDepartment.create({
    data: {
      name: 'Marketing',
      description: 'Marketing department',
      created_by_id: 1,
      updated_by_id: 1,
    },
  });

  const hrDepartment = await prisma.staffDepartment.create({
    data: {
      name: 'HR',
      description: 'Human Resources department',
      created_by_id: 1,
      updated_by_id: 1,
    },
  });

  const researchDepartment = await prisma.staffDepartment.create({
    data: {
      name: 'Research',
      description: 'Research and Development department',
      created_by_id: 1,
      updated_by_id: 1,
    },
  });

  // Create a staff position
  const rootPosition = await prisma.staffPosition.create({
    data: {
      name: 'CEO',
      description: 'CEO of Gesher',
      created_by_id: 1,
      updated_by_id: 1,
    },
  });

  const managerPosition = await prisma.staffPosition.create({
    data: {
      name: 'Manager',
      description: 'Manager of a specific sector',
      created_by_id: 1,
      updated_by_id: 1,
    },
  });

  const employeePosition = await prisma.staffPosition.create({
    data: {
      name: 'Employee',
      description: 'normal employee',
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
      department_id: adminDepartment.id,
      position_id: rootPosition.id,
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
      department_id: itDepartment.id,
      positionId: managerPosition.id,
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      department_id: marketingDepartment.id,
      positionId: managerPosition.id,
    },
    {
      firstName: 'Paul',
      lastName: 'Adams',
      email: 'paul.adams@example.com',
      department_id: hrDepartment.id,
      positionId: managerPosition.id,
    },
    {
      firstName: 'Sarah',
      lastName: 'Brown',
      email: 'sarah.brown@example.com',
      department_id: researchDepartment.id,
      positionId: managerPosition.id,
    },
    {
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@example.com',
      department_id: itDepartment.id,
      positionId: employeePosition.id,
    },
    {
      firstName: 'Michael',
      lastName: 'Wilson',
      email: 'michael.wilson@example.com',
      department_id: marketingDepartment.id,
      positionId: employeePosition.id,
    },
    {
      firstName: 'David',
      lastName: 'Taylor',
      email: 'david.taylor@example.com',
      department_id: hrDepartment.id,
      positionId: employeePosition.id,
    },
    {
      firstName: 'Rachel',
      lastName: 'Miller',
      email: 'rachel.miller@example.com',
      department_id: researchDepartment.id,
      positionId: employeePosition.id,
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
        department_id: member.department_id,
        position_id: member.positionId,
        bio: `${member.firstName} ${member.lastName} working in #${member.department_id} department.`,
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

  const permissionGroupResource = await prisma.permissionResource.create({
    data: { name: 'group' },
  });

  const permissionDepartmentResource = await prisma.permissionResource.create({
    data: { name: 'staff-department' },
  });

  const permissionPositionResource = await prisma.permissionResource.create({
    data: { name: 'staff-position' },
  });

  const permissionStaffPermissionResource =
    await prisma.permissionResource.create({
      data: { name: 'staff-permission' },
    });

  const permissionGroupPermissionResource =
    await prisma.permissionResource.create({
      data: { name: 'group-permission' },
    });

  const permissionStaffGroupResource = await prisma.permissionResource.create({
    data: { name: 'staff-group' },
  });

  const permissionAdsLanguageResource = await prisma.permissionResource.create({
    data: { name: 'ads-language' },
  });

  const permissionAdsPlatformResource = await prisma.permissionResource.create({
    data: { name: 'ads-platform' },
  });

  const permissionAdsToneResource = await prisma.permissionResource.create({
    data: { name: 'ads-tone' },
  });

  const permissionAdsIndustryResource = await prisma.permissionResource.create({
    data: { name: 'ads-industry' },
  });

  const permissionAdsCompanySizeResource =
    await prisma.permissionResource.create({
      data: { name: 'ads-company-size' },
    });

  // Create permissions
  const permissions = [
    // Auth Start ==================================
    // staff
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

    // group
    {
      name: '[Group] Create Group',
      permissionType: 'create',
      resource: permissionGroupResource,
    },
    {
      name: '[Group] Read Group',
      permissionType: 'read',
      resource: permissionGroupResource,
    },
    {
      name: '[Group] Edit Group',
      permissionType: 'edit',
      resource: permissionGroupResource,
    },
    {
      name: '[Group] Delete Group',
      permissionType: 'delete',
      resource: permissionGroupResource,
    },

    // department
    {
      name: '[Department] Create Staff Department',
      permissionType: 'create',
      resource: permissionDepartmentResource,
    },
    {
      name: '[Department] Read Staff Department',
      permissionType: 'read',
      resource: permissionDepartmentResource,
    },
    {
      name: '[Department] Edit Staff Department',
      permissionType: 'edit',
      resource: permissionDepartmentResource,
    },
    {
      name: '[Department] Delete Staff Department',
      permissionType: 'delete',
      resource: permissionDepartmentResource,
    },

    // position
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

    // permission assign
    {
      name: '[Staff Permission] Assign Permission',
      permissionType: 'assign',
      resource: permissionStaffPermissionResource,
    },
    {
      name: '[Group Permission] Assign Permission',
      permissionType: 'assign',
      resource: permissionGroupPermissionResource,
    },

    // group assign
    {
      name: '[Staff Group] Assign Group',
      permissionType: 'assign',
      resource: permissionStaffGroupResource,
    },
    // Auth End ==================================

    // Ads Gen Start ==================================
    // language
    {
      name: '[Ads Language] Create Ads Generative Language',
      permissionType: 'create',
      resource: permissionAdsLanguageResource,
    },
    {
      name: '[Ads Language] Read Ads Generative Language',
      permissionType: 'read',
      resource: permissionAdsLanguageResource,
    },
    {
      name: '[Ads Language] Edit Ads Language',
      permissionType: 'edit',
      resource: permissionAdsLanguageResource,
    },
    {
      name: '[Ads Language] Delete Ads Language',
      permissionType: 'delete',
      resource: permissionAdsLanguageResource,
    },

    // platform
    {
      name: '[Ads Platform] Create Ads Platform',
      permissionType: 'create',
      resource: permissionAdsPlatformResource,
    },
    {
      name: '[Ads Platform] Read Ads Platform',
      permissionType: 'read',
      resource: permissionAdsPlatformResource,
    },
    {
      name: '[Ads Platform] Edit Ads Platform',
      permissionType: 'edit',
      resource: permissionAdsPlatformResource,
    },
    {
      name: '[Ads Platform] Delete Ads Platform',
      permissionType: 'delete',
      resource: permissionAdsPlatformResource,
    },

    // tone
    {
      name: '[Ads Tone] Create Ads Tone',
      permissionType: 'create',
      resource: permissionAdsToneResource,
    },
    {
      name: '[Ads Tone] Read Ads Tone',
      permissionType: 'read',
      resource: permissionAdsToneResource,
    },
    {
      name: '[Ads Tone] Edit Ads Tone',
      permissionType: 'edit',
      resource: permissionAdsToneResource,
    },
    {
      name: '[Ads Tone] Delete Ads Tone',
      permissionType: 'delete',
      resource: permissionAdsToneResource,
    },

    // industy
    {
      name: '[Ads Industry] Create Ads Client Company Industry',
      permissionType: 'create',
      resource: permissionAdsIndustryResource,
    },
    {
      name: '[Ads Industry] Read Ads Client Company Industry',
      permissionType: 'read',
      resource: permissionAdsIndustryResource,
    },
    {
      name: '[Ads Industry] Edit Ads Client Company Industry',
      permissionType: 'edit',
      resource: permissionAdsIndustryResource,
    },
    {
      name: '[Ads Industry] Delete Ads Client Company Industry',
      permissionType: 'delete',
      resource: permissionAdsIndustryResource,
    },

    // industy
    {
      name: '[Ads Company Size] Create Ads Client Company Size',
      permissionType: 'create',
      resource: permissionAdsCompanySizeResource,
    },
    {
      name: '[Ads Company Size] Read Ads Client Company Size',
      permissionType: 'read',
      resource: permissionAdsCompanySizeResource,
    },
    {
      name: '[Ads Company Size] Edit Ads Client Company Size',
      permissionType: 'edit',
      resource: permissionAdsCompanySizeResource,
    },
    {
      name: '[Ads Company Size] Delete Ads Client Company Size',
      permissionType: 'delete',
      resource: permissionAdsCompanySizeResource,
    },
    // Ads Gen End ==================================
  ];

  for (const perm of permissions) {
    const permissionType = await prisma.permissionType.findUnique({
      where: { name: perm.permissionType },
    });

    await prisma.permission.create({
      data: {
        name: perm.name,
        type: { connect: { id: permissionType.id } },
        resource: { connect: { id: perm.resource.id } },
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
