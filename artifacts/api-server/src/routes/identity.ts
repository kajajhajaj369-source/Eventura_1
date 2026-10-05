import { eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  GetCurrentUserResponse,
  UpdateMyProfileBody,
  UpdateMyProfileResponse,
} from "@workspace/api-zod";
import { db, userProfilesTable, type AppRole, type UserProfile } from "@workspace/db";
import {
  loadProfileView,
  requireAuthenticatedProfile,
  requireRoles,
  SOLE_ADMIN_EMAIL,
  toUserProfileResponse,
} from "../middlewares/authorization";

const router: IRouter = Router();

router.get(
  "/auth/me",
  requireAuthenticatedProfile,
  async (_req, res): Promise<void> => {
    const current = res.locals.currentProfile as UserProfile;
    const view = await loadProfileView(current.id);
    if (!view) {
      res.status(404).json({ error: "Profile not found." });
      return;
    }
    res.json(GetCurrentUserResponse.parse(toUserProfileResponse(view)));
  },
);

router.patch(
  "/profile",
  requireAuthenticatedProfile,
  async (req, res): Promise<void> => {
    const parsed = UpdateMyProfileBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const current = res.locals.currentProfile as UserProfile;
    const updates: Partial<typeof userProfilesTable.$inferInsert> = {};
    if (parsed.data.name !== undefined) updates.name = parsed.data.name.trim();
    if (parsed.data.phone !== undefined) updates.phone = parsed.data.phone;
    if (parsed.data.department !== undefined) {
      updates.departmentName = parsed.data.department;
    }
    if (parsed.data.bio !== undefined) updates.bio = parsed.data.bio;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "Provide at least one profile field." });
      return;
    }

    await db
      .update(userProfilesTable)
      .set(updates)
      .where(eq(userProfilesTable.id, current.id));

    const view = await loadProfileView(current.id);
    if (!view) {
      res.status(404).json({ error: "Profile not found." });
      return;
    }
    res.json(UpdateMyProfileResponse.parse(toUserProfileResponse(view)));
  },
);

// Admin-only member designation management (only accessible by COLLEGE_ADMIN)
router.get(
  "/admin/members",
  requireAuthenticatedProfile,
  requireRoles("COLLEGE_ADMIN"),
  async (_req, res): Promise<void> => {
    const members = await db
      .select({
        id: userProfilesTable.id,
        name: userProfilesTable.name,
        email: userProfilesTable.email,
        role: userProfilesTable.roleKey,
        departmentName: userProfilesTable.departmentName,
        phone: userProfilesTable.phone,
        isActive: userProfilesTable.isActive,
        createdAt: userProfilesTable.createdAt,
      })
      .from(userProfilesTable)
      .orderBy(userProfilesTable.name);

    res.json({
      adminEmail: SOLE_ADMIN_EMAIL,
      members,
    });
  },
);

router.patch(
  "/admin/members/:id/role",
  requireAuthenticatedProfile,
  requireRoles("COLLEGE_ADMIN"),
  async (req, res): Promise<void> => {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles: AppRole[] = ["CLUB", "ORGANIZER", "STUDENT", "VOLUNTEER"];
    if (!allowedRoles.includes(role)) {
      res.status(400).json({
        error: "Invalid designation. Allowed designations are CLUB, ORGANIZER, STUDENT, and VOLUNTEER. There is only one COLLEGE_ADMIN (kajajhajaj369@gmail.com).",
      });
      return;
    }

    const [targetUser] = await db
      .select()
      .from(userProfilesTable)
      .where(eq(userProfilesTable.id, id))
      .limit(1);

    if (!targetUser) {
      res.status(404).json({ error: "User profile not found." });
      return;
    }

    if (targetUser.email.toLowerCase() === SOLE_ADMIN_EMAIL.toLowerCase()) {
      res.status(400).json({
        error: "Cannot change the primary administrator designation.",
      });
      return;
    }

    await db
      .update(userProfilesTable)
      .set({ roleKey: role })
      .where(eq(userProfilesTable.id, id));

    const [updated] = await db
      .select({
        id: userProfilesTable.id,
        name: userProfilesTable.name,
        email: userProfilesTable.email,
        role: userProfilesTable.roleKey,
        departmentName: userProfilesTable.departmentName,
        isActive: userProfilesTable.isActive,
      })
      .from(userProfilesTable)
      .where(eq(userProfilesTable.id, id))
      .limit(1);

    res.json({
      success: true,
      message: `Designation updated to ${role}`,
      member: updated,
    });
  },
);

export default router;