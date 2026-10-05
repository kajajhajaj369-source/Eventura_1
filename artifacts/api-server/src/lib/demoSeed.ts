import { and, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  auditLogsTable,
  attendanceTable,
  budgetsTable,
  certificatesTable,
  clubMembersTable,
  clubsTable,
  collegesTable,
  departmentsTable,
  eventRegistrationsTable,
  eventsTable,
  expensesTable,
  feedbackTable,
  notificationsTable,
  tasksTable,
  userProfilesTable,
  volunteerAssignmentsTable,
  type AppRole,
  type Club,
  type College,
  type Department,
  type Event,
  type UserProfile,
} from "@workspace/db";

async function getDemoCollege(input: {
  slug: string;
  name: string;
  shortName: string;
}): Promise<College> {
  const { slug, name, shortName } = input;
  const [existing] = await db
    .select()
    .from(collegesTable)
    .where(eq(collegesTable.slug, slug))
    .limit(1);
  if (existing) return existing;

  const [created] = await db
    .insert(collegesTable)
    .values({
      slug,
      name,
      shortName,
      timezone: "Asia/Kolkata",
    })
    .onConflictDoNothing()
    .returning();
  if (created) return created;

  const [retried] = await db
    .select()
    .from(collegesTable)
    .where(eq(collegesTable.slug, slug))
    .limit(1);
  if (!retried) throw new Error(`Could not create demo campus ${name}.`);
  return retried;
}

async function getDepartment(
  collegeId: string,
  name: string,
  code: string,
): Promise<Department> {
  const [existing] = await db
    .select()
    .from(departmentsTable)
    .where(
      and(
        eq(departmentsTable.collegeId, collegeId),
        eq(departmentsTable.name, name),
      ),
    )
    .limit(1);
  if (existing) return existing;

  const [created] = await db
    .insert(departmentsTable)
    .values({ collegeId, name, code })
    .onConflictDoNothing()
    .returning();
  if (created) return created;

  const [retried] = await db
    .select()
    .from(departmentsTable)
    .where(
      and(
        eq(departmentsTable.collegeId, collegeId),
        eq(departmentsTable.name, name),
      ),
    )
    .limit(1);
  if (!retried) throw new Error(`Could not create demo department ${name}.`);
  return retried;
}

async function getDemoProfile(input: {
  key: string;
  name: string;
  roleKey: AppRole;
  collegeId: string;
  departmentId: string;
}): Promise<UserProfile> {
  const authUserId = `eventura_demo_${input.key}`;
  const email = `${input.key.replaceAll("_", ".")}@demo.eventura.invalid`;
  const [existing] = await db
    .select()
    .from(userProfilesTable)
    .where(eq(userProfilesTable.authUserId, authUserId))
    .limit(1);
  if (existing) return existing;

  const [created] = await db
    .insert(userProfilesTable)
    .values({
      authUserId,
      name: input.name,
      email,
      roleKey: input.roleKey,
      collegeId: input.collegeId,
      departmentId: input.departmentId,
    })
    .onConflictDoNothing()
    .returning();
  if (created) return created;

  const [retried] = await db
    .select()
    .from(userProfilesTable)
    .where(eq(userProfilesTable.authUserId, authUserId))
    .limit(1);
  if (!retried) {
    throw new Error(`Could not create demo profile ${input.name}.`);
  }
  return retried;
}

async function getDemoClub(
  input: {
    collegeId: string;
    departmentId: string;
    slug: string;
    name: string;
    description: string;
  },
): Promise<Club> {
  const { collegeId, departmentId, slug, name, description } = input;
  const [existing] = await db
    .select()
    .from(clubsTable)
    .where(and(eq(clubsTable.collegeId, collegeId), eq(clubsTable.slug, slug)))
    .limit(1);
  if (existing) return existing;

  const [created] = await db
    .insert(clubsTable)
    .values({
      collegeId,
      departmentId,
      name,
      slug,
      description,
    })
    .onConflictDoNothing()
    .returning();
  if (created) return created;

  const [retried] = await db
    .select()
    .from(clubsTable)
    .where(and(eq(clubsTable.collegeId, collegeId), eq(clubsTable.slug, slug)))
    .limit(1);
  if (!retried) throw new Error(`Could not create demo club ${name}.`);
  return retried;
}

function futureAtDayOffset(dayOffset: number, hour = 12): Date {
  const now = new Date();
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + dayOffset,
      hour,
    ),
  );
}

async function getDemoEvent(input: {
  collegeId: string;
  departmentId: string;
  clubId: string;
  organizerId: string;
  title: string;
  status: "PUBLISHED" | "SUBMITTED";
  startsAt: Date;
  venue: string;
  category: string;
}): Promise<Event> {
  const [existing] = await db
    .select()
    .from(eventsTable)
    .where(
      and(
        eq(eventsTable.collegeId, input.collegeId),
        eq(eventsTable.title, input.title),
      ),
    )
    .limit(1);
  if (existing) return existing;

  const [created] = await db
    .insert(eventsTable)
    .values({
      ...input,
      description: `Seeded Phase 1 fixture for the ${input.title} dashboard.`,
      endsAt: new Date(input.startsAt.getTime() + 3 * 60 * 60 * 1000),
      capacity: 180,
      registrationDeadline: new Date(input.startsAt.getTime() - 24 * 60 * 60 * 1000),
    })
    .onConflictDoNothing()
    .returning();
  if (created) return created;

  const [retried] = await db
    .select()
    .from(eventsTable)
    .where(
      and(
        eq(eventsTable.collegeId, input.collegeId),
        eq(eventsTable.title, input.title),
      ),
    )
    .limit(1);
  if (!retried) throw new Error(`Could not create demo event ${input.title}.`);
  return retried;
}

async function ensureClubMember(
  clubId: string,
  userId: string,
  membershipRole: string,
): Promise<void> {
  const [existing] = await db
    .select({ id: clubMembersTable.id })
    .from(clubMembersTable)
    .where(
      and(
        eq(clubMembersTable.clubId, clubId),
        eq(clubMembersTable.userId, userId),
      ),
    )
    .limit(1);
  if (existing) return;
  await db
    .insert(clubMembersTable)
    .values({ clubId, userId, membershipRole })
    .onConflictDoNothing();
}

async function ensureRegistration(
  eventId: string,
  studentId: string,
): Promise<string> {
  const [existing] = await db
    .select({ id: eventRegistrationsTable.id })
    .from(eventRegistrationsTable)
    .where(
      and(
        eq(eventRegistrationsTable.eventId, eventId),
        eq(eventRegistrationsTable.studentId, studentId),
      ),
    )
    .limit(1);
  if (existing) return existing.id;
  const [created] = await db
    .insert(eventRegistrationsTable)
    .values({ eventId, studentId })
    .onConflictDoNothing()
    .returning({ id: eventRegistrationsTable.id });
  if (created) return created.id;

  const [retried] = await db
    .select({ id: eventRegistrationsTable.id })
    .from(eventRegistrationsTable)
    .where(
      and(
        eq(eventRegistrationsTable.eventId, eventId),
        eq(eventRegistrationsTable.studentId, studentId),
      ),
    )
    .limit(1);
  if (!retried) throw new Error("Could not create a demo registration.");
  return retried.id;
}

async function getDemoTask(
  eventId: string,
  assigneeId: string,
  title: string,
): Promise<string> {
  const [existing] = await db
    .select({ id: tasksTable.id })
    .from(tasksTable)
    .where(
      and(
        eq(tasksTable.eventId, eventId),
        eq(tasksTable.assigneeId, assigneeId),
        eq(tasksTable.title, title),
      ),
    )
    .limit(1);
  if (existing) return existing.id;

  const [created] = await db
    .insert(tasksTable)
    .values({
      eventId,
      assigneeId,
      title,
      description: "Example assignment included to exercise the volunteer dashboard.",
      location: "Student Union",
      dueAt: futureAtDayOffset(5, 10),
    })
    .returning({ id: tasksTable.id });
  if (!created) throw new Error(`Could not create demo task ${title}.`);
  return created.id;
}

async function ensureVolunteerAssignment(input: {
  eventId: string;
  volunteerId: string;
  taskId: string;
  dutyRole: string;
  startsAt: Date;
  endsAt: Date;
}): Promise<void> {
  const [existing] = await db
    .select({ id: volunteerAssignmentsTable.id })
    .from(volunteerAssignmentsTable)
    .where(
      and(
        eq(volunteerAssignmentsTable.eventId, input.eventId),
        eq(volunteerAssignmentsTable.volunteerId, input.volunteerId),
        eq(volunteerAssignmentsTable.taskId, input.taskId),
      ),
    )
    .limit(1);
  if (existing) return;
  await db
    .insert(volunteerAssignmentsTable)
    .values(input)
    .onConflictDoNothing();
}

type DemoCampusConfig = {
  slug: string;
  name: string;
  shortName: string;
  profilePrefix: string;
  club: {
    name: string;
    slug: string;
    description: string;
  };
  eventOne: {
    title: string;
    venue: string;
  };
  eventTwo: {
    title: string;
    venue: string;
  };
};

const DEMO_CAMPUSES: DemoCampusConfig[] = [
  {
    slug: "demo-campus",
    name: "Northstar University",
    shortName: "Northstar",
    profilePrefix: "",
    club: {
      name: "Campus Makers",
      slug: "campus-makers",
      description:
        "A student club for design, technology, and campus projects.",
    },
    eventOne: {
      title: "Campus Creative Week",
      venue: "Northstar Student Union",
    },
    eventTwo: {
      title: "Research & Innovation Forum",
      venue: "Innovation Hall",
    },
  },
  {
    slug: "vit-pune",
    name: "VIT Pune",
    shortName: "VIT",
    profilePrefix: "vit_",
    club: {
      name: "VIT Robotics & Innovation Club",
      slug: "robotics-innovation",
      description:
        "A student community for robotics, engineering, and applied innovation.",
    },
    eventOne: {
      title: "VIT Pune Tech & Culture Fest",
      venue: "VIT Pune Main Quad",
    },
    eventTwo: {
      title: "VIT Innovation and Research Showcase",
      venue: "VIT Pune Innovation Hall",
    },
  },
];

async function seedDemoCampus(
  campusConfig: DemoCampusConfig,
): Promise<void> {
  const college = await getDemoCollege(campusConfig);
  const department = await getDepartment(
    college.id,
    "Design & Technology",
    "DTECH",
  );
  const administration = await getDepartment(
    college.id,
    "Student Affairs",
    "STUAFF",
  );

  const [admin, clubLead, organizer, student1, student2, student3, volunteer1, volunteer2] =
    await Promise.all([
      getDemoProfile({
        key: `${campusConfig.profilePrefix}college_admin`,
        name: "Avery Campus",
        roleKey: "COLLEGE_ADMIN",
        collegeId: college.id,
        departmentId: administration.id,
      }),
      getDemoProfile({
        key: `${campusConfig.profilePrefix}club`,
        name: "Jordan Lee",
        roleKey: "CLUB",
        collegeId: college.id,
        departmentId: department.id,
      }),
      getDemoProfile({
        key: `${campusConfig.profilePrefix}organizer`,
        name: "Sam Rivera",
        roleKey: "ORGANIZER",
        collegeId: college.id,
        departmentId: department.id,
      }),
      getDemoProfile({
        key: `${campusConfig.profilePrefix}student_one`,
        name: "Taylor Morgan",
        roleKey: "STUDENT",
        collegeId: college.id,
        departmentId: department.id,
      }),
      getDemoProfile({
        key: `${campusConfig.profilePrefix}student_two`,
        name: "Casey Patel",
        roleKey: "STUDENT",
        collegeId: college.id,
        departmentId: department.id,
      }),
      getDemoProfile({
        key: `${campusConfig.profilePrefix}student_three`,
        name: "Morgan Chen",
        roleKey: "STUDENT",
        collegeId: college.id,
        departmentId: administration.id,
      }),
      getDemoProfile({
        key: `${campusConfig.profilePrefix}volunteer_one`,
        name: "Riley Brooks",
        roleKey: "VOLUNTEER",
        collegeId: college.id,
        departmentId: department.id,
      }),
      getDemoProfile({
        key: `${campusConfig.profilePrefix}volunteer_two`,
        name: "Jamie Okafor",
        roleKey: "VOLUNTEER",
        collegeId: college.id,
        departmentId: administration.id,
      }),
    ]);

  const club = await getDemoClub({
    collegeId: college.id,
    departmentId: department.id,
    ...campusConfig.club,
  });
  await Promise.all([
    ensureClubMember(club.id, clubLead.id, "PRESIDENT"),
    ensureClubMember(club.id, organizer.id, "ORGANIZER"),
    ensureClubMember(club.id, student1.id, "MEMBER"),
    ensureClubMember(club.id, student2.id, "MEMBER"),
    ensureClubMember(club.id, student3.id, "MEMBER"),
    ensureClubMember(club.id, volunteer1.id, "MEMBER"),
    ensureClubMember(club.id, volunteer2.id, "MEMBER"),
  ]);

  const eventOne = await getDemoEvent({
    collegeId: college.id,
    departmentId: department.id,
    clubId: club.id,
    organizerId: organizer.id,
    title: campusConfig.eventOne.title,
    status: "PUBLISHED",
    startsAt: futureAtDayOffset(5),
    venue: campusConfig.eventOne.venue,
    category: "CULTURE",
  });
  const eventTwo = await getDemoEvent({
    collegeId: college.id,
    departmentId: department.id,
    clubId: club.id,
    organizerId: organizer.id,
    title: campusConfig.eventTwo.title,
    status: "SUBMITTED",
    startsAt: futureAtDayOffset(12),
    venue: campusConfig.eventTwo.venue,
    category: "ACADEMIC",
  });


  // ── Registrations ────────────────────────────────────────────────────────
  // eventOne: all 3 students + volunteer1 registered (4 registrations)
  // eventTwo: all 3 students registered (3 registrations)
  const [reg1, reg2, reg3, reg4, reg5, reg6] = await Promise.all([
    ensureRegistration(eventOne.id, student1.id),
    ensureRegistration(eventOne.id, student2.id),
    ensureRegistration(eventOne.id, student3.id),
    ensureRegistration(eventOne.id, volunteer1.id),
    ensureRegistration(eventTwo.id, student1.id),
    ensureRegistration(eventTwo.id, student2.id),
  ]);
  const reg7 = await ensureRegistration(eventTwo.id, student3.id);

  // ── Attendance ───────────────────────────────────────────────────────────
  // Mark student1, student2, volunteer1 as attended eventOne
  for (const [regId, checkedInBy] of [
    [reg1, volunteer1.id],
    [reg2, volunteer1.id],
    [reg4, volunteer2.id],
  ] as [string, string][]) {
    const [existing] = await db
      .select({ id: attendanceTable.id })
      .from(attendanceTable)
      .where(eq(attendanceTable.registrationId, regId))
      .limit(1);
    if (!existing) {
      await db
        .insert(attendanceTable)
        .values({ registrationId: regId, checkedInBy })
        .onConflictDoNothing();
    }
  }

  // ── Volunteer tasks ───────────────────────────────────────────────────────
  const task1 = await getDemoTask(eventOne.id, volunteer1.id, "Welcome desk");
  const task2 = await getDemoTask(eventOne.id, volunteer2.id, "Room support");
  const task3 = await getDemoTask(eventOne.id, volunteer1.id, "Stage setup");
  const task4 = await getDemoTask(eventTwo.id, volunteer2.id, "Registration booth");
  await Promise.all([
    ensureVolunteerAssignment({
      eventId: eventOne.id,
      volunteerId: volunteer1.id,
      taskId: task1,
      dutyRole: "WELCOME_DESK",
      startsAt: eventOne.startsAt,
      endsAt: eventOne.endsAt,
    }),
    ensureVolunteerAssignment({
      eventId: eventOne.id,
      volunteerId: volunteer2.id,
      taskId: task2,
      dutyRole: "ROOM_SUPPORT",
      startsAt: eventOne.startsAt,
      endsAt: eventOne.endsAt,
    }),
    ensureVolunteerAssignment({
      eventId: eventOne.id,
      volunteerId: volunteer1.id,
      taskId: task3,
      dutyRole: "STAGE_CREW",
      startsAt: new Date(eventOne.startsAt.getTime() - 2 * 60 * 60 * 1000),
      endsAt: eventOne.startsAt,
    }),
    ensureVolunteerAssignment({
      eventId: eventTwo.id,
      volunteerId: volunteer2.id,
      taskId: task4,
      dutyRole: "REGISTRATION",
      startsAt: eventTwo.startsAt,
      endsAt: eventTwo.endsAt,
    }),
  ]);

  // ── Budgets & Expenses ────────────────────────────────────────────────────
  // eventOne budget
  let budgetOneId: string | undefined;
  {
    const [existing] = await db
      .select({ id: budgetsTable.id })
      .from(budgetsTable)
      .where(eq(budgetsTable.eventId, eventOne.id))
      .limit(1);
    budgetOneId = existing?.id;
    if (!budgetOneId) {
      const [created] = await db
        .insert(budgetsTable)
        .values({ eventId: eventOne.id, allocatedAmount: "35000.00", status: "APPROVED" })
        .onConflictDoNothing()
        .returning({ id: budgetsTable.id });
      budgetOneId = created?.id;
    }
  }
  if (budgetOneId) {
    for (const expense of [
      { category: "MATERIALS",   amount: "4200.00",  description: "Printed banners and brochures",    status: "APPROVED",   daysAgo: -3 },
      { category: "CATERING",    amount: "9500.00",  description: "Refreshments and snacks",          status: "APPROVED",   daysAgo: -2 },
      { category: "AUDIO_VIDEO", amount: "7800.00",  description: "Sound system and projector rental", status: "SUBMITTED",  daysAgo: -1 },
      { category: "TRANSPORT",   amount: "2100.00",  description: "Guest speaker travel reimbursement", status: "SUBMITTED", daysAgo: 0 },
      { category: "DECOR",       amount: "1500.00",  description: "Stage decoration and props",        status: "PENDING",    daysAgo: 0 },
    ] as { category: string; amount: string; description: string; status: string; daysAgo: number }[]) {
      const [existing] = await db
        .select({ id: expensesTable.id })
        .from(expensesTable)
        .where(and(eq(expensesTable.budgetId, budgetOneId), eq(expensesTable.description, expense.description)))
        .limit(1);
      if (!existing) {
        await db.insert(expensesTable).values({
          budgetId: budgetOneId,
          submittedBy: organizer.id,
          category: expense.category,
          amount: expense.amount,
          description: expense.description,
          status: expense.status,
          spentAt: futureAtDayOffset(expense.daysAgo),
        });
      }
    }
  }

  // eventTwo budget
  let budgetTwoId: string | undefined;
  {
    const [existing] = await db
      .select({ id: budgetsTable.id })
      .from(budgetsTable)
      .where(eq(budgetsTable.eventId, eventTwo.id))
      .limit(1);
    budgetTwoId = existing?.id;
    if (!budgetTwoId) {
      const [created] = await db
        .insert(budgetsTable)
        .values({ eventId: eventTwo.id, allocatedAmount: "18000.00", status: "DRAFT" })
        .onConflictDoNothing()
        .returning({ id: budgetsTable.id });
      budgetTwoId = created?.id;
    }
  }
  if (budgetTwoId) {
    for (const expense of [
      { category: "PRINTING",    amount: "2800.00", description: "Research poster printing",     status: "SUBMITTED",  daysAgo: -1 },
      { category: "CATERING",    amount: "5000.00", description: "Light refreshments for guests", status: "PENDING",   daysAgo: 0 },
    ] as { category: string; amount: string; description: string; status: string; daysAgo: number }[]) {
      const [existing] = await db
        .select({ id: expensesTable.id })
        .from(expensesTable)
        .where(and(eq(expensesTable.budgetId, budgetTwoId), eq(expensesTable.description, expense.description)))
        .limit(1);
      if (!existing) {
        await db.insert(expensesTable).values({
          budgetId: budgetTwoId,
          submittedBy: organizer.id,
          category: expense.category,
          amount: expense.amount,
          description: expense.description,
          status: expense.status,
          spentAt: futureAtDayOffset(expense.daysAgo),
        });
      }
    }
  }

  // ── Feedback ─────────────────────────────────────────────────────────────
  // Feedback for eventOne from student1, student2, student3
  for (const [userId, rating, comment] of [
    [student1.id, 5, "Excellent event! Well organised and very engaging. Looking forward to the next one."],
    [student2.id, 4, "Really enjoyed the sessions. The venue was great and the team was helpful."],
    [student3.id, 4, "Good event overall. Would love more networking time between sessions."],
  ] as [string, number, string][]) {
    const [existing] = await db
      .select({ id: feedbackTable.id })
      .from(feedbackTable)
      .where(and(eq(feedbackTable.eventId, eventOne.id), eq(feedbackTable.userId, userId)))
      .limit(1);
    if (!existing) {
      await db.insert(feedbackTable).values({ eventId: eventOne.id, userId, rating, comment });
    }
  }
  // Feedback for eventTwo from student1
  {
    const [existing] = await db
      .select({ id: feedbackTable.id })
      .from(feedbackTable)
      .where(and(eq(feedbackTable.eventId, eventTwo.id), eq(feedbackTable.userId, student1.id)))
      .limit(1);
    if (!existing) {
      await db.insert(feedbackTable).values({
        eventId: eventTwo.id,
        userId: student1.id,
        rating: 5,
        comment: "Fantastic research presentations. Very inspiring to see student innovation on display.",
      });
    }
  }

  // ── Certificates ──────────────────────────────────────────────────────────
  // eventOne certificates: student1 ISSUED, student2 ISSUED, student3 PENDING, volunteer1 AWARDED
  for (const [recipientId, certificateType, status, issuedAt] of [
    [student1.id,   "PARTICIPATION",  "ISSUED",  futureAtDayOffset(-2)],
    [student2.id,   "PARTICIPATION",  "ISSUED",  futureAtDayOffset(-2)],
    [student3.id,   "PARTICIPATION",  "PENDING", null],
    [volunteer1.id, "APPRECIATION",   "ISSUED",  futureAtDayOffset(-1)],
    [organizer.id,  "ORGANIZER",      "ISSUED",  futureAtDayOffset(-1)],
  ] as [string, string, string, Date | null][]) {
    const [existing] = await db
      .select({ id: certificatesTable.id })
      .from(certificatesTable)
      .where(and(eq(certificatesTable.eventId, eventOne.id), eq(certificatesTable.recipientId, recipientId)))
      .limit(1);
    if (!existing) {
      await db.insert(certificatesTable).values({
        eventId: eventOne.id,
        recipientId,
        certificateType,
        status,
        issuedAt: issuedAt ?? undefined,
      }).onConflictDoNothing();
    }
  }
  // eventTwo certificates: student1 PENDING, student2 PENDING
  for (const [recipientId, certificateType] of [
    [student1.id, "PARTICIPATION"],
    [student2.id, "PARTICIPATION"],
    [student3.id, "PARTICIPATION"],
  ] as [string, string][]) {
    const [existing] = await db
      .select({ id: certificatesTable.id })
      .from(certificatesTable)
      .where(and(eq(certificatesTable.eventId, eventTwo.id), eq(certificatesTable.recipientId, recipientId)))
      .limit(1);
    if (!existing) {
      await db.insert(certificatesTable).values({
        eventId: eventTwo.id,
        recipientId,
        certificateType,
        status: "PENDING",
      }).onConflictDoNothing();
    }
  }

  // ── Notifications ─────────────────────────────────────────────────────────
  const notifEntries: { recipientId: string; title: string; body: string; category: string }[] = [
    {
      recipientId: student1.id,
      title: "Welcome to EVENTURA",
      body: "Your campus event dashboard is ready. Start exploring upcoming events!",
      category: "GENERAL",
    },
    {
      recipientId: student1.id,
      title: "Your certificate is ready",
      body: `Your participation certificate for ${eventOne.title} has been issued. Download it from your Certificates section.`,
      category: "CERTIFICATE",
    },
    {
      recipientId: student2.id,
      title: "Welcome to EVENTURA",
      body: "Your campus event dashboard is ready. Start exploring upcoming events!",
      category: "GENERAL",
    },
    {
      recipientId: student2.id,
      title: "Your certificate is ready",
      body: `Your participation certificate for ${eventOne.title} has been issued.`,
      category: "CERTIFICATE",
    },
    {
      recipientId: student3.id,
      title: "Welcome to EVENTURA",
      body: "Your campus event dashboard is ready.",
      category: "GENERAL",
    },
    {
      recipientId: student3.id,
      title: "Registration confirmed",
      body: `You are registered for ${eventOne.title}. Your QR pass will be available closer to the event.`,
      category: "REGISTRATION",
    },
    {
      recipientId: organizer.id,
      title: "Event approved",
      body: `${eventOne.title} has been approved and is now published.`,
      category: "EVENT",
    },
    {
      recipientId: volunteer1.id,
      title: "Assignment confirmed",
      body: `You have been assigned to the Welcome Desk for ${eventOne.title}.`,
      category: "VOLUNTEER",
    },
    {
      recipientId: admin.id,
      title: "Pending approval",
      body: `${eventTwo.title} is awaiting your review and approval.`,
      category: "APPROVAL",
    },
  ];
  for (const notif of notifEntries) {
    const [existing] = await db
      .select({ id: notificationsTable.id })
      .from(notificationsTable)
      .where(and(eq(notificationsTable.recipientId, notif.recipientId), eq(notificationsTable.title, notif.title)))
      .limit(1);
    if (!existing) {
      await db.insert(notificationsTable).values(notif);
    }
  }

  // ── Audit logs ────────────────────────────────────────────────────────────
  const auditEntries: { action: string; entityType: string; entityId: string; metadata: Record<string, unknown> }[] = [
    {
      action: "EVENT_PUBLISHED",
      entityType: "EVENT",
      entityId: eventOne.id,
      metadata: { title: eventOne.title, publishedBy: admin.id },
    },
    {
      action: "EVENT_SUBMITTED",
      entityType: "EVENT",
      entityId: eventTwo.id,
      metadata: { title: eventTwo.title, submittedBy: organizer.id },
    },
    {
      action: "CERTIFICATE_ISSUED",
      entityType: "CERTIFICATE",
      entityId: eventOne.id,
      metadata: { recipientCount: 2, eventTitle: eventOne.title },
    },
    {
      action: "BUDGET_APPROVED",
      entityType: "BUDGET",
      entityId: eventOne.id,
      metadata: { allocatedAmount: "35000.00", currency: "INR" },
    },
    {
      action: "DEMO_DATA_READY",
      entityType: "DEMO_SEED",
      entityId: eventOne.id,
      metadata: { fixture: "development-only" },
    },
  ];
  for (const entry of auditEntries) {
    const [existing] = await db
      .select({ id: auditLogsTable.id })
      .from(auditLogsTable)
      .where(
        and(
          eq(auditLogsTable.collegeId, college.id),
          eq(auditLogsTable.actorId, admin.id),
          eq(auditLogsTable.action, entry.action),
        ),
      )
      .limit(1);
    if (!existing) {
      await db.insert(auditLogsTable).values({
        collegeId: college.id,
        actorId: admin.id,
        ...entry,
      });
    }
  }
}

export async function seedDemoData(): Promise<void> {
  for (const campus of DEMO_CAMPUSES) {
    await seedDemoCampus(campus);
  }
}