import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding HireFlow database...');

  // Demo users
  const users = [
    { email: 'admin@avenir.com', password: 'Admin@1234', fullName: 'Sarah Al-Rashidi', title: 'HR Director', department: 'Human Resources', roles: ['master_admin', 'hr_manager'] },
    { email: 'hr@avenir.com', password: 'Hr@12345', fullName: 'Mohammed Al-Khalidi', title: 'HR Manager', department: 'Human Resources', roles: ['hr_manager'] },
    { email: 'recruiter@avenir.com', password: 'Rec@1234', fullName: 'Priya Nair', title: 'Recruiter', department: 'Human Resources', roles: ['recruiter'] },
    { email: 'dept@avenir.com', password: 'Dept@1234', fullName: 'James Thornton', title: 'Head of Engineering', department: 'Engineering', roles: ['department_head'] },
    { email: 'finance@avenir.com', password: 'Fin@1234', fullName: 'Ahmed Hassan', title: 'Finance Director', department: 'Finance', roles: ['finance'] },
    { email: 'interviewer@avenir.com', password: 'Int@1234', fullName: 'Liu Wei', title: 'Senior Engineer', department: 'Engineering', roles: ['interviewer'] },
    { email: 'officer@avenir.com', password: 'Off@1234', fullName: 'Fatima Al-Ameri', title: 'HR Officer', department: 'Human Resources', roles: ['hr_officer'] },
  ];

  const profiles: Record<string, string> = {};

  for (const user of users) {
    const hash = await bcrypt.hash(user.password, 12);
    const profile = await prisma.profile.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        password: hash,
        fullName: user.fullName,
        title: user.title,
        department: user.department,
        roles: JSON.stringify(user.roles),
        isActive: true,
      },
    });
    profiles[user.email] = profile.id;
    console.log(`  ✓ ${user.fullName} (${user.roles.join(', ')})`);
  }

  // Salary bands
  await prisma.salaryBand.deleteMany({});
  const salaryBandData = [
    { roleTitle: 'Graduate Engineer', level: 'E1', department: 'Engineering', minSalary: 60000, maxSalary: 90000, currency: 'USD', effectiveFrom: new Date('2024-01-01') },
    { roleTitle: 'Engineer', level: 'E2', department: 'Engineering', minSalary: 85000, maxSalary: 125000, currency: 'USD', effectiveFrom: new Date('2024-01-01') },
    { roleTitle: 'Senior Engineer', level: 'E3', department: 'Engineering', minSalary: 120000, maxSalary: 170000, currency: 'USD', effectiveFrom: new Date('2024-01-01') },
    { roleTitle: 'Principal Engineer', level: 'E4', department: 'Engineering', minSalary: 160000, maxSalary: 220000, currency: 'USD', effectiveFrom: new Date('2024-01-01') },
    { roleTitle: 'Engineering Director', level: 'E5', department: 'Engineering', minSalary: 200000, maxSalary: 280000, currency: 'USD', effectiveFrom: new Date('2024-01-01') },
    { roleTitle: 'Project Manager', level: 'M1', department: 'Management', minSalary: 100000, maxSalary: 150000, currency: 'USD', effectiveFrom: new Date('2024-01-01') },
    { roleTitle: 'Senior Project Manager', level: 'M2', department: 'Management', minSalary: 140000, maxSalary: 200000, currency: 'USD', effectiveFrom: new Date('2024-01-01') },
    { roleTitle: 'Financial Analyst', level: 'F1', department: 'Finance', minSalary: 65000, maxSalary: 95000, currency: 'USD', effectiveFrom: new Date('2024-01-01') },
    { roleTitle: 'Reservoir Engineer', level: 'E3', department: 'Petroleum', minSalary: 120000, maxSalary: 175000, currency: 'USD', effectiveFrom: new Date('2024-01-01') },
    { roleTitle: 'Principal Petroleum Engineer', level: 'E4', department: 'Petroleum', minSalary: 160000, maxSalary: 230000, currency: 'USD', effectiveFrom: new Date('2024-01-01') },
  ];

  const bandIds: Record<string, string> = {};
  for (const band of salaryBandData) {
    const b = await prisma.salaryBand.create({ data: band });
    bandIds[`${band.level}_${band.department}`] = b.id;
  }
  console.log('  ✓ Salary bands created');

  // Email templates
  const emailTemplates = [
    { triggerEvent: 'cv_submitted', name: 'Application Received', subject: 'We received your application for {{roleTitle}}', bodyHtml: '<p>Dear {{candidateName}},</p><p>Thank you for applying for <strong>{{roleTitle}}</strong> at Avenir International Engineers. We will review your application and be in touch shortly.</p>' },
    { triggerEvent: 'shortlisted', name: 'Shortlisted Notification', subject: 'Good news about your application for {{roleTitle}}', bodyHtml: '<p>Dear {{candidateName}},</p><p>We are pleased to inform you that your application for <strong>{{roleTitle}}</strong> has been shortlisted. Our HR team will contact you to discuss next steps.</p>' },
    { triggerEvent: 'interview_scheduled', name: 'Interview Invitation', subject: 'Interview Invitation — {{roleTitle}}', bodyHtml: '<p>Dear {{candidateName}},</p><p>You have been invited to interview for <strong>{{roleTitle}}</strong>. Please find the details below.</p>' },
    { triggerEvent: 'offer_sent', name: 'Offer Letter', subject: 'Job Offer — {{roleTitle}} at Avenir International Engineers', bodyHtml: '<p>Dear {{candidateName}},</p><p>We are delighted to extend an offer for the position of <strong>{{roleTitle}}</strong>. Please click the link below to review and respond to your offer.</p>' },
    { triggerEvent: 'rejected', name: 'Rejection Notification', subject: 'Update on your application for {{roleTitle}}', bodyHtml: '<p>Dear {{candidateName}},</p><p>Thank you for your interest in <strong>{{roleTitle}}</strong> at Avenir International Engineers. After careful consideration, we have decided not to proceed with your application at this time.</p>' },
  ];

  for (const template of emailTemplates) {
    await prisma.emailConfig.upsert({
      where: { triggerEvent: template.triggerEvent },
      update: {},
      create: template,
    });
  }
  console.log('  ✓ Email templates seeded');

  // Clear candidates for idempotent seeding
  await prisma.candidate.deleteMany({});

  // Demo candidates
  const candidateList = [
    {
      fullName: 'David Okafor',
      email: 'david.okafor@example.com',
      phone: '+44 7700 900123',
      nationality: 'Nigerian',
      currentLocation: 'London, UK',
      currentTitle: 'Senior Petroleum Engineer',
      currentEmployer: 'Shell International',
      yearsExperience: 12,
      appliedRoleTitle: 'Principal Petroleum Engineer',
      expectedSalary: 180000,
      currency: 'USD',
      source: 'linkedin',
      status: 'cv_shortlisted' as const,
      salaryBandId: bandIds['E4_Petroleum'],
      assignedHrId: profiles['hr@avenir.com'],
      submittedById: profiles['recruiter@avenir.com'],
      tags: JSON.stringify(['oil-gas', 'offshore', 'senior']),
      notes: 'Strong candidate with North Sea experience. Fast track.',
    },
    {
      fullName: 'Aisha Rahman',
      email: 'aisha.rahman@example.com',
      phone: '+971 50 123 4567',
      nationality: 'Pakistani',
      currentLocation: 'Dubai, UAE',
      currentTitle: 'Reservoir Engineer',
      currentEmployer: 'ADNOC',
      yearsExperience: 8,
      appliedRoleTitle: 'Senior Reservoir Engineer',
      expectedSalary: 140000,
      currency: 'USD',
      source: 'referral',
      status: 'interview_scheduled' as const,
      salaryBandId: bandIds['E3_Petroleum'],
      assignedHrId: profiles['hr@avenir.com'],
      submittedById: profiles['recruiter@avenir.com'],
      tags: JSON.stringify(['reservoir', 'middle-east']),
      notes: 'Internal referral from James Thornton.',
    },
    {
      fullName: 'Carlos Mendez',
      email: 'carlos.mendez@example.com',
      nationality: 'Mexican',
      currentLocation: 'Houston, TX',
      currentTitle: 'Pipeline Engineer',
      currentEmployer: 'Chevron',
      yearsExperience: 6,
      appliedRoleTitle: 'Pipeline Engineer',
      expectedSalary: 120000,
      currency: 'USD',
      source: 'website',
      status: 'cv_review' as const,
      salaryBandId: bandIds['E2_Engineering'],
      assignedHrId: profiles['officer@avenir.com'],
      submittedById: profiles['hr@avenir.com'],
      tags: JSON.stringify(['pipeline', 'onshore']),
      notes: null,
    },
    {
      fullName: 'Sophie Laurent',
      email: 'sophie.laurent@example.com',
      nationality: 'French',
      currentLocation: 'Paris, France',
      currentTitle: 'HSE Manager',
      currentEmployer: 'TotalEnergies',
      yearsExperience: 10,
      appliedRoleTitle: 'HSE Director',
      expectedSalary: 160000,
      currency: 'USD',
      source: 'headhunt',
      status: 'offer_sent' as const,
      salaryBandId: bandIds['M2_Management'],
      assignedHrId: profiles['hr@avenir.com'],
      submittedById: profiles['recruiter@avenir.com'],
      tags: JSON.stringify(['hse', 'management']),
      notes: null,
    },
    {
      fullName: 'Ravi Shankar',
      email: 'ravi.shankar@example.com',
      phone: '+91 98765 43210',
      nationality: 'Indian',
      currentLocation: 'Mumbai, India',
      currentTitle: 'Project Manager',
      currentEmployer: 'L&T Energy',
      yearsExperience: 15,
      appliedRoleTitle: 'Senior Project Manager',
      expectedSalary: 155000,
      currency: 'USD',
      source: 'linkedin',
      status: 'hired' as const,
      salaryBandId: bandIds['M2_Management'],
      assignedHrId: profiles['hr@avenir.com'],
      submittedById: profiles['recruiter@avenir.com'],
      tags: JSON.stringify(['project-management', 'epc']),
      notes: 'Hired — joining Jan 2025.',
    },
    {
      fullName: 'Emma Johansson',
      email: 'emma.johansson@example.com',
      nationality: 'Swedish',
      currentLocation: 'Stockholm, Sweden',
      currentTitle: 'Graduate Engineer',
      currentEmployer: 'Aker Solutions',
      yearsExperience: 2,
      appliedRoleTitle: 'Graduate Mechanical Engineer',
      expectedSalary: 70000,
      currency: 'USD',
      source: 'graduate_program',
      status: 'cv_submitted' as const,
      salaryBandId: bandIds['E1_Engineering'],
      assignedHrId: profiles['officer@avenir.com'],
      submittedById: profiles['hr@avenir.com'],
      tags: JSON.stringify(['graduate', 'mechanical']),
      notes: null,
    },
    {
      fullName: 'Omar Al-Farsi',
      email: 'omar.alfarsi@example.com',
      nationality: 'Omani',
      currentLocation: 'Muscat, Oman',
      currentTitle: 'Production Engineer',
      currentEmployer: 'Petroleum Development Oman',
      yearsExperience: 9,
      appliedRoleTitle: 'Production Engineer',
      expectedSalary: 130000,
      currency: 'USD',
      source: 'website',
      status: 'cv_rejected' as const,
      salaryBandId: bandIds['E3_Engineering'],
      assignedHrId: profiles['officer@avenir.com'],
      submittedById: profiles['recruiter@avenir.com'],
      tags: JSON.stringify(['production', 'gcc']),
      notes: null,
    },
    {
      fullName: 'Yuki Tanaka',
      email: 'yuki.tanaka@example.com',
      phone: '+81 90 1234 5678',
      nationality: 'Japanese',
      currentLocation: 'Tokyo, Japan',
      currentTitle: 'Drilling Engineer',
      currentEmployer: 'INPEX',
      yearsExperience: 7,
      appliedRoleTitle: 'Senior Drilling Engineer',
      expectedSalary: 145000,
      currency: 'USD',
      source: 'agency',
      status: 'cv_submitted' as const,
      salaryBandId: bandIds['E3_Engineering'],
      assignedHrId: profiles['hr@avenir.com'],
      submittedById: profiles['recruiter@avenir.com'],
      tags: JSON.stringify(['drilling', 'offshore', 'asia']),
      notes: null,
    },
  ];

  const candidateIds: Record<string, string> = {};
  for (const candidate of candidateList) {
    const c = await prisma.candidate.create({ data: candidate });
    candidateIds[candidate.email] = c.id;
    console.log(`  ✓ Candidate: ${candidate.fullName}`);
  }

  // Audit events for the hired candidate
  const hiredId = candidateIds['ravi.shankar@example.com'];
  if (hiredId) {
    const auditSteps = [
      { action: 'create', entityType: 'candidate', metadata: 'Candidate profile created' },
      { action: 'update', entityType: 'candidate', metadata: 'Status changed to cv_review' },
      { action: 'submit', entityType: 'cv_review', metadata: 'CV review submitted — Shortlist' },
      { action: 'update', entityType: 'candidate', metadata: 'Status changed to shortlisted' },
      { action: 'create', entityType: 'interview', metadata: 'Round 1: HR Screen scheduled' },
      { action: 'create', entityType: 'interview', metadata: 'Round 2: Technical Interview scheduled' },
      { action: 'update', entityType: 'candidate', metadata: 'Status changed to offer_approved' },
      { action: 'send', entityType: 'offer', metadata: 'Offer letter sent to candidate' },
      { action: 'update', entityType: 'candidate', metadata: 'Candidate accepted the offer' },
      { action: 'update', entityType: 'candidate', metadata: 'Status changed to hired' },
    ];
    for (const step of auditSteps) {
      await prisma.auditEvent.create({
        data: {
          actorId: profiles['hr@avenir.com'],
          candidateId: hiredId,
          action: step.action,
          entityType: step.entityType,
          entityId: hiredId,
          metadata: JSON.stringify({ message: step.metadata }),
        },
      });
    }
    console.log('  ✓ Audit trail created for Ravi Shankar');
  }

  console.log('\n✅ Seed complete!');
  console.log('\nDemo login credentials:');
  users.forEach((u) => console.log(`  ${u.email} / ${u.password}  [${u.roles.join(', ')}]`));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
